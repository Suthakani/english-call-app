const { GRAMMAR_VOCAB, LISTENING_SCENARIOS, WRITING_PROMPTS } = require("../data/eventQuestionBank");

// Simple deterministic string hash -> seed for a shuffle, so the SAME
// periodKey (e.g. "2026-W38") always produces the SAME picks (fair for
// everyone that week), while a different week's key shuffles differently.
const seededShuffle = (arr, seedStr) => {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;

  const rand = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed / 4294967296;
  };

  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Points by difficulty tier — this is what makes the ranking
// "correct answers + difficulty level" rather than flat correct-count.
const DIFFICULTY_POINTS = { easy: 1, medium: 2, hard: 3 };

// Returns the full question set for a given week's periodKey, WITHOUT
// answers (safe to send to the client), plus an internal answer key kept
// server-side only for grading.
const getEventQuestions = (periodKey) => {
  const gv = seededShuffle(GRAMMAR_VOCAB, periodKey + "-gv");
  const listening = seededShuffle(LISTENING_SCENARIOS, periodKey + "-l");
  const writingIdx = Math.abs(
    periodKey.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 7)
  ) % WRITING_PROMPTS.length;

  const grammarVocab = gv.map(({ id, difficulty, q, options }) => ({ id, difficulty, q, options }));
  const listeningSafe = listening.map(({ id, difficulty, scenario, q, options }) => ({ id, difficulty, scenario, q, options }));
  const writingPrompt = WRITING_PROMPTS[writingIdx];

  return { grammarVocab, listening: listeningSafe, writingPrompt };
};

// Grades multiple-choice answers (grammar/vocab + listening) against the
// answer key, weighted by difficulty. Returns { score, maxScore, correctCount }.
const gradeObjectiveAnswers = (periodKey, answers) => {
  // answers: { [questionId]: selectedOptionText }
  const gv = GRAMMAR_VOCAB;
  const listening = LISTENING_SCENARIOS;
  const all = [...gv, ...listening];

  let score = 0;
  let maxScore = 0;
  let correctCount = 0;

  all.forEach((q) => {
    const pts = DIFFICULTY_POINTS[q.difficulty] || 1;
    maxScore += pts;
    if (answers[q.id] && answers[q.id] === q.answer) {
      score += pts;
      correctCount++;
    }
  });

  return { objectiveScore: score, objectiveMax: maxScore, correctCount, totalQuestions: all.length };
};

module.exports = { getEventQuestions, gradeObjectiveAnswers, DIFFICULTY_POINTS };