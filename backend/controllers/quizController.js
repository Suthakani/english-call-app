const quizContent = require("../data/quizContent");
const User = require("../models/User");

const normalize = (s) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/[.,!?'"]/g, "")
    .replace(/\s+/g, " ");

// Checks if the user's answer is "close enough" to any accepted answer:
// - exact match after normalizing, OR
// - the accepted answer appears as a substring inside the user's text, OR
// - every significant word (>2 letters) in the accepted answer also
//   appears somewhere in the user's text (order-independent) — this is
//   what lets "because they forgot their phone" match the accepted
//   answer "forgot phone" instead of being marked wrong.
const isAnswerCorrect = (userAnswer, acceptedAnswers) => {
  const userNorm = normalize(userAnswer);
  if (!userNorm) return false;

  return acceptedAnswers.some((accepted) => {
    const acceptedNorm = normalize(accepted);

    if (userNorm === acceptedNorm) return true;
    if (userNorm.includes(acceptedNorm)) return true;

    const acceptedWords = acceptedNorm.split(" ").filter((w) => w.length > 2);
    if (acceptedWords.length > 0) {
      const userWords = new Set(userNorm.split(" "));
      const allWordsPresent = acceptedWords.every((w) => userWords.has(w));
      if (allWordsPresent) return true;
    }

    return false;
  });
};

// Grammar is level-based (100 levels of 10 questions — an array of
// arrays). Other categories are still basic/intermediate/advanced for
// now. This helper picks the right question list either way.
const getQuestionList = (category, levelParam) => {
  const content = quizContent[category];
  if (!content) return null;

  if (Array.isArray(content)) {
    // Level-based category (e.g. grammar): levelParam is a level number 1-100
    const levelNum = parseInt(levelParam, 10);
    if (!levelNum || levelNum < 1 || levelNum > content.length) return null;
    return content[levelNum - 1];
  }

  // Legacy basic/intermediate/advanced category: levelParam is the string key
  return content[levelParam] || null;
};

// ── Certificate ID ──
// Stable, human-readable ID: SK-<CAT3>-<YEAR>-<last4 of userId>
// Built once from the certificate's OWN issuedAt date (not "today"), so
// the ID never changes no matter when it's later viewed or re-verified.
const CERT_ID_PREFIX = "SK";
const buildCertId = (category, issuedAt, userId) => {
  const cat3 = (category || "GEN").slice(0, 3).toUpperCase();
  const year = new Date(issuedAt).getFullYear();
  const last4 = String(userId || "0000").slice(-4).padStart(4, "0");
  return `${CERT_ID_PREFIX}-${cat3}-${year}-${last4}`;
};

// @route GET /api/quiz/:category/:level
// For grammar, :level is a number (1-100). For other categories, :level
// is still "basic"/"intermediate"/"advanced".
// Sends questions WITHOUT the answer field, so the correct answer is
// never visible in the browser/network tab before the user answers.
const getQuiz = async (req, res) => {
  const { category, level } = req.params;
  const questions = getQuestionList(category, level) || [];

  const safeQuestions = questions.map(({ q, hint }, index) => ({ index, q, hint }));

  // For level-based categories, also tell the frontend the user's
  // current unlocked level and the total number of levels, so it can
  // show "Level X of 100" and lock/unlock navigation.
  const content = quizContent[category];
  let levelInfo = null;
  if (Array.isArray(content) && req.user) {
    const user = await User.findById(req.user._id).select("quizLevels").lean();
    const unlockedLevel = user?.quizLevels?.[category] || 1;
    levelInfo = { totalLevels: content.length, unlockedLevel };
  }

  res.json({ questions: safeQuestions, levelInfo });
};

// @route POST /api/quiz/check
// body: { category, level, index, userAnswer }
const checkQuizAnswer = async (req, res) => {
  const { category, level, index, userAnswer } = req.body;
  const questions = getQuestionList(category, level) || [];
  const question = questions[index];

  if (!question) {
    return res.status(400).json({ message: "Invalid question reference" });
  }

  const isCorrect = isAnswerCorrect(userAnswer, question.answer);

  // Award 2 points for each correct answer.
  // Award 10 points for each correct answer.
if (isCorrect && req.user) {
  await User.findByIdAndUpdate(req.user._id, { $inc: { points: 10 } });
}

  res.json({
    correct: isCorrect,
    correctAnswer: question.answer[0],
  });
};

// @route POST /api/quiz/:category/complete-level
// body: { level }
// Called when the user finishes all 10 questions of a level. Advances
// their unlocked level for this category by 1 (only if they just
// completed the level they were actually on — can't skip ahead).
const completeLevel = async (req, res) => {
  try {
    const { category } = req.params;
    const { level } = req.body;
    const levelNum = parseInt(level, 10);

    const content = quizContent[category];
    if (!Array.isArray(content)) {
      return res.status(400).json({ message: "This category doesn't use levels" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const currentUnlocked = user.quizLevels?.[category] || 1;
    let certificateEarned = false;

    if (levelNum === currentUnlocked && levelNum < content.length) {
      user.quizLevels[category] = currentUnlocked + 1;
      user.points = (user.points || 0) + 2000;
    } else if (levelNum === currentUnlocked && levelNum === content.length) {
      // Final level (100) just completed — award the certificate once.
      const alreadyHas = (user.certificates || []).some(c => c.category === category);
      if (!alreadyHas) {
        const issuedAt = new Date();
        const certId = buildCertId(category, issuedAt, user._id);
        user.certificates = user.certificates || [];
        user.certificates.push({ category, issuedAt, certId });
        certificateEarned = true;
      }
      user.points = (user.points || 0) + 2000;
    }

    await user.save();

    res.json({
      unlockedLevel: user.quizLevels[category],
      totalLevels: content.length,
      certificateEarned,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update level progress", error: error.message });
  }
};

// @route GET /api/quiz/certificate/:category
// Requires login — returns the logged-in user's own certificate for a
// category, including its permanent certId (used to build the QR code
// on the certificate page).
const getCertificate = async (req, res) => {
  try {
    const { category } = req.params;
    const user = await User.findById(req.user._id).select("username certificates");
    if (!user) return res.status(404).json({ message: "User not found" });

    const cert = (user.certificates || []).find(c => c.category === category);
    if (!cert) return res.status(404).json({ message: "Certificate not earned yet" });

    // Backfill: certificates issued before certId existed on the schema
    // won't have one yet. Compute and save it once here so every future
    // view/verify of this certificate uses the same permanent ID.
    if (!cert.certId) {
      cert.certId = buildCertId(cert.category, cert.issuedAt, user._id);
      await user.save();
    }

    res.json({
      username: user.username,
      category: cert.category,
      issuedAt: cert.issuedAt,
      certId: cert.certId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load certificate", error: error.message });
  }
};

// @route GET /api/quiz/verify/:certId
// PUBLIC — no login required. Anyone who scans a certificate's QR code
// lands here. Looks a certificate up purely by its certId (independent
// of any user session) and confirms whether it's genuine.
const verifyCertificate = async (req, res) => {
  try {
    const { certId } = req.params;
    if (!certId) return res.status(400).json({ valid: false, message: "Missing certificate ID" });

    const user = await User.findOne({ "certificates.certId": certId }).select("username certificates");
    if (!user) {
      return res.status(404).json({ valid: false, message: "No certificate found with this ID" });
    }

    const cert = user.certificates.find(c => c.certId === certId);

    res.json({
      valid: true,
      username: user.username,
      category: cert.category,
      issuedAt: cert.issuedAt,
      certId: cert.certId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ valid: false, message: "Could not verify certificate" });
  }
};

module.exports = { getQuiz, checkQuizAnswer, completeLevel, getCertificate, verifyCertificate };