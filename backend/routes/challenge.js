const express = require('express');
const router = express.Router();
const challenges = require('../data/challenges');
const ChallengeCompletion = require('../models/ChallengeCompletion');
const UserChallengeState = require('../models/UserChallengeState');
const { protect: requireAuth } = require('../middleware/authMiddleware');

const todayStr = () => new Date().toISOString().slice(0, 10);

const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const gradeAnswer = (question, text) => {
  if (!text || text.trim().length < 3) return false;
  if (question.keywords.length === 0) return true;
  const lower = text.toLowerCase();
  return question.keywords.some(k => lower.includes(k));
};

// Figures out which challenge this user should see today, without ever
// repeating one until every challenge in the pool has been shown once.
// Cycle wraps only after all challenges are exhausted, and avoids the
// last-of-previous-cycle == first-of-new-cycle edge case.
const getOrAssignTodaysSlug = async userId => {
  const allSlugs = challenges.map(c => c.slug);
  let state = await UserChallengeState.findOne({ user: userId });

  if (!state) {
    state = await UserChallengeState.create({
      user: userId,
      order: shuffle(allSlugs),
      position: 0,
      lastAssignedDate: todayStr(),
      lastAssignedSlug: null,
    });
    state.lastAssignedSlug = state.order[0];
    await state.save();
    return state.lastAssignedSlug;
  }

  if (state.lastAssignedDate === todayStr() && state.lastAssignedSlug) {
    return state.lastAssignedSlug; // already assigned today, keep it stable
  }

  let nextPosition = state.position + 1;
  let order = state.order;

  if (nextPosition >= order.length) {
    // Cycle finished — reshuffle, but make sure the new first slug isn't
    // the same as the one we just showed (avoids back-to-back repeat).
    let reshuffled = shuffle(allSlugs);
    if (reshuffled[0] === state.lastAssignedSlug && reshuffled.length > 1) {
      [reshuffled[0], reshuffled[1]] = [reshuffled[1], reshuffled[0]];
    }
    order = reshuffled;
    nextPosition = 0;
  }

  state.order = order;
  state.position = nextPosition;
  state.lastAssignedSlug = order[nextPosition];
  state.lastAssignedDate = todayStr();
  await state.save();
  return state.lastAssignedSlug;
};

// GET today's challenge + this user's status for it
router.get('/today', requireAuth, async (req, res) => {
  const slug = await getOrAssignTodaysSlug(req.user.id);
  const challenge = challenges.find(c => c.slug === slug) || challenges[0];

  const completion = await ChallengeCompletion.findOne({
    user: req.user.id, date: todayStr(), slug: challenge.slug,
  });

  res.json({
  challenge: { slug: challenge.slug, icon: challenge.icon, title: challenge.title, desc: challenge.desc, audioUrl: challenge.audioUrl, questions: challenge.questions.map(q => ({ id: q.id, text: q.text })) },
  completed: !!completion,
  result: completion ? { score: completion.score, maxScore: completion.maxScore, passed: completion.passed, badgeAwarded: completion.badgeAwarded } : null,
});
});

// POST answers, get graded + badge
router.post('/:slug/submit', requireAuth, async (req, res) => {
  const { slug } = req.params;
  const { answers } = req.body;
  const challenge = challenges.find(c => c.slug === slug);
  if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

  const existing = await ChallengeCompletion.findOne({ user: req.user.id, date: todayStr(), slug });
  if (existing) return res.status(409).json({ message: 'Already completed today', result: existing });

  let score = 0;
  const feedback = challenge.questions.map(q => {
    const ans = answers.find(a => a.questionId === q.id);
    const correct = gradeAnswer(q, ans?.text);
    if (correct) score++;
    return { questionId: q.id, correct, tip: correct ? null : 'Try including more specific detail related to the question.' };
  });

  const maxScore = challenge.questions.length;
  const passed = score / maxScore >= 0.6; // 60% threshold — used for "Passed"/"Missed" in history
  // Badge is a separate, stricter bar than "passed" — only a perfect score
  // earns it, so it means "aced it" rather than just "cleared it".
  const badgeAwarded = score === maxScore ? 'daily-challenge' : null;

  const record = await ChallengeCompletion.create({
    user: req.user.id, date: todayStr(), slug,
    answers, score, maxScore, passed, badgeAwarded,
  });
  const pointsEarned = score * 10;
await require('../models/User').findByIdAndUpdate(req.user.id, { $inc: { points: pointsEarned } });

res.json({ score, maxScore, passed, badgeAwarded, feedback, pointsEarned });

 
});

// GET user's challenge history for profile
router.get('/history', requireAuth, async (req, res) => {
  const records = await ChallengeCompletion.find({ user: req.user.id }).sort({ date: -1 }).limit(30);
  res.json(records.map(r => ({
    date: r.date, slug: r.slug, score: r.score, maxScore: r.maxScore,
    passed: r.passed, badgeAwarded: r.badgeAwarded,
  })));
});

module.exports = router;