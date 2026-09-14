const {
  GRAMMAR_VOCAB,
  LISTENING_SCENARIOS,
  IMAGE_VOCAB,
  IDIOMS_IMAGES,
  READING_COMPREHENSION,
  WRITING_PROMPTS,
} = require("../data/eventQuestionBank");

// Overall timer for the whole challenge (single countdown, not per-question).
const CHALLENGE_DURATION_SECONDS = 10 * 60; // 10 minutes
const CHALLENGE_GRACE_SECONDS = 20; // network/latency buffer for submit

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

const DIFFICULTY_POINTS = { easy: 1, medium: 2, hard: 3 };

const getEventQuestions = (periodKey) => {
  const gv = seededShuffle(GRAMMAR_VOCAB, periodKey + "-gv");
  const listening = seededShuffle(LISTENING_SCENARIOS, periodKey + "-l");
  const imageVocab = seededShuffle(IMAGE_VOCAB, periodKey + "-iv");
  const idioms = seededShuffle(IDIOMS_IMAGES, periodKey + "-id");
  const reading = seededShuffle(READING_COMPREHENSION, periodKey + "-rc");

  const writingIdx = Math.abs(
    periodKey.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 7)
  ) % WRITING_PROMPTS.length;

  const grammarVocab = gv.map(({ id, difficulty, q, options }) => ({ id, difficulty, q, options }));
  const listeningSafe = listening.map(({ id, difficulty, scenario, q, options }) => ({ id, difficulty, scenario, q, options }));
  const imageVocabSafe = imageVocab.map(({ id, difficulty, imageUrl, q, options }) => ({ id, difficulty, imageUrl, q, options }));
  const idiomsSafe = idioms.map(({ id, difficulty, imageUrl, q, options }) => ({ id, difficulty, imageUrl, q, options }));
  const readingSafe = reading.map(({ id, imageUrl, passage, questions }) => ({
    id,
    imageUrl,
    passage,
    questions: questions.map(({ id: qid, difficulty, q, options }) => ({ id: qid, difficulty, q, options })),
  }));
  const writingPrompt = WRITING_PROMPTS[writingIdx];

  return {
    grammarVocab,
    listening: listeningSafe,
    imageVocab: imageVocabSafe,
    idioms: idiomsSafe,
    reading: readingSafe,
    writingPrompt,
    durationSeconds: CHALLENGE_DURATION_SECONDS,
  };
};

// Grades ALL multiple-choice categories (grammar/vocab, listening, image
// vocab, idioms, reading comprehension) against the answer key, weighted
// by difficulty. Returns { objectiveScore, objectiveMax, correctCount, totalQuestions }.
const gradeObjectiveAnswers = (periodKey, answers) => {
  const readingQuestions = READING_COMPREHENSION.flatMap((rc) => rc.questions);
  const all = [...GRAMMAR_VOCAB, ...LISTENING_SCENARIOS, ...IMAGE_VOCAB, ...IDIOMS_IMAGES, ...readingQuestions];

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

module.exports = {
  getEventQuestions,
  gradeObjectiveAnswers,
  DIFFICULTY_POINTS,
  CHALLENGE_DURATION_SECONDS,
  CHALLENGE_GRACE_SECONDS,
};