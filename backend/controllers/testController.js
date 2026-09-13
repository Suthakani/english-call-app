const fetch = require("node-fetch");
const PendingTest = require("../models/PendingTest");
const TestResult = require("../models/TestResult");
const User = require("../models/User");

const callGroq = async (prompt, temperature = 0.5, model = "llama-3.1-8b-instant") => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature,
      response_format: { type: "json_object" },
    }),
  });
  const data = await response.json();
  if (!data.choices) throw new Error(JSON.stringify(data));
  return JSON.parse(data.choices[0].message.content);
};

// Generates 6 sentences in the user's native language (2 basic, 2 intermediate, 2 advanced)
// along with their correct English translation, for translation-based level testing.
//
// NOTE: this uses the larger llama-3.3-70b-versatile model instead of the
// 8b-instant default. The 8b model reliably produces garbled/mojibake text
// for non-Latin scripts with complex conjunct characters (Tamil, Telugu,
// Malayalam, etc.) — it's simply too small to handle those scripts
// reliably. The 70b model has much stronger multilingual generation and
// doesn't have this problem. Grading (below) stays on the small model
// since that's pure English reasoning, which 8b handles fine.
const generateQuestions = async (language) => {
  const prompt = `Generate 6 sentences written naturally and correctly in ${language} (using proper ${language} script, not transliteration) for testing someone's ability to translate ${language} into English.
Create exactly 2 "basic" difficulty sentences (simple present/past tense, short),
2 "intermediate" difficulty sentences (conditionals, passive voice, or perfect tenses),
and 2 "advanced" difficulty sentences (complex clauses like "unless", "once", unreal conditionals, or idiomatic expressions).
Sentences should be natural, everyday, and about real-life topics (work, travel, family, daily life).
Double check that every sentence is grammatically correct, properly spelled ${language}, with no stray or repeated characters.

Respond ONLY with valid JSON, no markdown, in this exact shape:
{
  "questions": [
    { "sentence": "sentence written in ${language}", "referenceEnglish": "correct English translation", "difficulty": "basic" }
  ]
}`;
  // generateQuestions — was: callGroq(prompt, 0.7, "llama-3.3-70b-versatile")
const result = await callGroq(prompt, 0.7, "openai/gpt-oss-120b");
  return result.questions;
};

// Fixed instruction sentence shown above the test, translated into the
// user's native language so non-Tamil speakers don't see Tanglish text.
// English fallback used if translation fails for any reason.
const INSTRUCTION_EN = "A sentence will appear in your native language. Type its correct English translation. This helps us match you to the right category.";

const translateInstruction = async (language) => {
  if (!language || language.toLowerCase() === "english") return INSTRUCTION_EN;
  try {
    const prompt = `Translate this English sentence into natural, everyday ${language} (using proper ${language} script, not transliteration). Respond ONLY with valid JSON, no markdown, in this exact shape: { "translated": "the translation here" }

Sentence: "${INSTRUCTION_EN}"`;
    const result = await callGroq(prompt, 0.3, "openai/gpt-oss-120b");
    return result.translated || INSTRUCTION_EN;
  } catch (err) {
    console.error("Instruction translation failed:", err.message);
    return INSTRUCTION_EN;
  }
};

// @route GET /api/test/questions
// Generates fresh questions in the logged-in user's native language and stores the
// reference answers server-side (PendingTest) until they submit.
const getQuestions = async (req, res) => {
  try {
    const language = req.user.nativeLanguage || "Tamil";
    const [generated, instruction] = await Promise.all([
      generateQuestions(language),
      translateInstruction(language),
    ]);

    const questions = generated.map((q, i) => ({
      id: `q${i + 1}`,
      sentence: q.sentence,
      referenceEnglish: q.referenceEnglish,
      difficulty: q.difficulty,
    }));

    await PendingTest.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, language, questions, createdAt: new Date() },
      { upsert: true }
    );

    // only send sentence + id + difficulty to client, never the reference answer
    res.json({
      questions: questions.map(({ id, sentence, difficulty }) => ({ id, sentence, difficulty })),
      instruction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not generate test questions. Check GROQ_API_KEY.", error: error.message });
  }
};

// Calls Groq to grade all translation answers in a single request.
//
// NOTE: the reference English is only ONE example of a correct translation, not the
// only correct one. Earlier versions of this prompt graded against near-exact match,
// which wrongly flagged grammatically valid answers as incorrect — e.g. "had not met"
// vs "hadn't met" (same meaning, contraction vs full form), or valid mixed conditionals
// like "If I had been born..., I would be..." vs the reference's "If I were born...".
// The prompt below explicitly calls out these equivalence classes and gives worked
// examples so the model grades meaning/grammar instead of surface wording.
//
// NOTE 2: grading was moved from llama-3.1-8b-instant to llama-3.3-70b-versatile.
// The 8b model wasn't just being too strict — it was outright hallucinating meaning
// differences that didn't exist (e.g. claiming "had no money" and "didn't have money"
// mean opposite things). That's a reasoning failure, not a leniency setting, so a
// bigger model is used here despite the extra cost/latency. The "reasoning" field in
// the JSON output also forces the model to state what each sentence actually means
// before deciding isCorrect, instead of deciding first and rationalizing after.
const gradeTranslationsWithAI = async (items) => {
  const prompt = `You are an English teacher grading translations done by learners.
For each item below, compare the learner's English translation to the reference translation.
Judge meaning accuracy AND grammar quality (tense, word order, articles, subject-verb agreement).

The "Reference English" is only ONE example of a correct translation, not the only correct one.
Grade for grammatical correctness and meaning, NOT for exact word match against the reference.

CRITICAL RULE — do not invent a difference that isn't really there. Before marking something
incorrect, restate in your own head what the learner's sentence actually means and what the
reference actually means, and check they are truly different — not just worded differently.
A wrong "isCorrect: false" that invents a fake meaning difference is a worse mistake than being
too lenient. If you are not sure there is a real error, mark it correct.

Treat the following as EQUIVALENT and CORRECT, never mark them wrong just for this difference:
- Contractions vs full forms ("hadn't" = "had not", "wouldn't" = "would not", "I'm" = "I am")
- Valid mixed conditionals (e.g. "If I had been born in America, I would be a successful entrepreneur"
  is a correct mixed conditional — past condition, present result — even if the reference uses
  "If I were born...")
- Synonymous phrasing of the same fact ("had no money" = "didn't have money", "was unable to" =
  "couldn't")
- Different but equally valid connecting words when both fit the sentence's logic ("if" vs "once"
  vs "when" are often interchangeable in conditional/time clauses — don't fail an answer just
  because it picked a different one than the reference, unless it actually changes the meaning)
- Different but valid word order, synonyms, or phrasing that preserves the same meaning
- British vs American spelling or phrasing variants

Only mark isCorrect: false when there is an ACTUAL grammar error (wrong tense that changes meaning,
subject-verb disagreement, wrong article, garbled sentence) or the meaning is genuinely different
from the original sentence — e.g. it reverses who did what, negates something that should be
affirmative (or vice versa), or changes a key fact.

Example A (should be CORRECT):
  Reference English: "If I hadn't met him, I wouldn't know anything about my life."
  Learner's answer: "If I had not met him, I would not know anything about my life."
  → isCorrect: true — "had not"/"hadn't" and "would not"/"wouldn't" are the same, just contracted vs full form.

Example B (should be CORRECT):
  Reference English: "If I were born in America, I would be a successful entrepreneur."
  Learner's answer: "If I had been born in America, I would be a successful entrepreneur."
  → isCorrect: true — this is a valid mixed conditional, commonly used by native speakers.

Example C (should be INCORRECT):
  Reference English: "She has finished her homework."
  Learner's answer: "She have finished her homework."
  → isCorrect: false — subject-verb agreement error ("have" should be "has").

Example D (should be CORRECT):
  Reference English: "He couldn't study because he didn't have money."
  Learner's answer: "He could not study because he had no money."
  → isCorrect: true — "didn't have money" and "had no money" state the exact same fact. There is
  no real meaning difference here; do not claim there is one.

Example E (should be CORRECT):
  Reference English: "Once you finish your work, I will help you."
  Learner's answer: "If you finish your work, I will help you."
  → isCorrect: true — "once" and "if" both work as the connecting word here without changing the
  overall meaning of the sentence.

Items:
${items
  .map(
    (it, i) =>
      `${i + 1}. Original sentence: "${it.sentence}"\n   Reference English: "${it.referenceEnglish}"\n   Learner's answer: "${it.userAnswer}"`
  )
  .join("\n\n")}

Respond ONLY with valid JSON in this exact shape, no markdown. Fill "reasoning" first for each item
(one short sentence stating what each sentence actually means and whether they truly differ), THEN
decide "isCorrect" based on that reasoning — don't decide first and justify after:
{
  "results": [
    { "index": 1, "reasoning": "one short sentence comparing actual meanings", "isCorrect": boolean, "score": number (0 to 1), "feedback": "very short simple Tanglish feedback explaining what was right/wrong. If correct despite differing from the reference, briefly say why it's still correct (e.g. 'same meaning, just contraction')." }
  ]
}`;
  // gradeTranslationsWithAI — was: callGroq(prompt, 0.2, "llama-3.3-70b-versatile")
const result = await callGroq(prompt, 0.2, "openai/gpt-oss-120b");
  return result.results;
};

// @route POST /api/test/submit   body: { answers: [{questionId, userAnswer}] }
const submitTest = async (req, res) => {
  try {
    const pending = await PendingTest.findOne({ user: req.user._id });
    if (!pending) {
      return res.status(400).json({ message: "No active test found. Please start the test again." });
    }

    const { answers } = req.body;
    const items = answers
      .map((a) => {
        const q = pending.questions.find((q) => q.id === a.questionId);
        if (!q) return null;
        return { ...q.toObject(), userAnswer: a.userAnswer || "" };
      })
      .filter(Boolean);

    const graded = await gradeTranslationsWithAI(items);

    const weight = { basic: 1, intermediate: 2, advanced: 3 };
    let score = 0;
    let difficultySum = 0;
    const gradedAnswers = [];
    const detailedResults = [];

    items.forEach((item, i) => {
      const g = graded.find((r) => r.index === i + 1) || { isCorrect: false, score: 0, feedback: "" };
      if (g.isCorrect) {
        score += 1;
        difficultySum += weight[item.difficulty];
      }
      gradedAnswers.push({
        questionId: item.id,
        selected: item.userAnswer,
        correct: item.referenceEnglish,
        isCorrect: g.isCorrect,
      });
      detailedResults.push({
        questionId: item.id,
        sentence: item.sentence,
        yourAnswer: item.userAnswer,
        correctAnswer: item.referenceEnglish,
        isCorrect: g.isCorrect,
        feedback: g.feedback,
        difficulty: item.difficulty,
      });
    });
    let assignedLevel = "basic";
    const avgDifficulty = score > 0 ? difficultySum / score : 0;
    if (avgDifficulty >= 1.8 && score >= items.length * 0.6) assignedLevel = "advanced";
    else if (avgDifficulty >= 1.3 && score >= items.length * 0.4) assignedLevel = "intermediate";

    const result = await TestResult.create({
      user: req.user._id,
      score,
      totalQuestions: items.length,
      assignedLevel,
      answers: gradedAnswers,
    });

    await User.findByIdAndUpdate(req.user._id, { level: assignedLevel });
    await PendingTest.deleteOne({ user: req.user._id });

    res.json({
      score,
      totalQuestions: items.length,
      assignedLevel,
      resultId: result._id,
      detailedResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Grading failed. Check GROQ_API_KEY is set.", error: error.message });
  }
};

// @route POST /api/test/set-categories body: { categories: ["interview","travel"] }
const setCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferredCategories: categories },
      { new: true }
    );
    res.json({ preferredCategories: user.preferredCategories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getQuestions, submitTest, setCategories };