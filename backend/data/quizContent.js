// Fixed question banks — served via API, checked server-side.
// Keeping this on the backend means the correct answers are never sent
// to the browser until after the user has answered.

const grammarQuestions = require('./grammarQuestions');
const vocabularyQuestions = require('./vocabularyQuestions');
const listeningQuestions = require('./listeningQuestions');
const pronunciationQuestions = require('./pronunciationQuestions');
const dailyPracticeQuestions = require('./dailyPracticeQuestions');
// Deterministic shuffle so the same level always shows the same order
// (no Math.random — uses the level number as a seed).
const seededShuffle = (arr, seed) => {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Builds 100 levels of 10 questions each from a pool of unique questions,
// cycling through the pool and reshuffling each time it wraps around so
// repeats don't feel identical.
const buildLevels = (pool, totalLevels = 100, perLevel = 10) => {
  const levels = [];
  const cycleLength = Math.ceil(pool.length / perLevel);
  for (let level = 1; level <= totalLevels; level++) {
    const cycleNum = Math.floor((level - 1) / cycleLength);
    const posInCycle = (level - 1) % cycleLength;
    const shuffled = cycleNum === 0 ? pool : seededShuffle(pool, cycleNum * 1000 + 7);
    const start = posInCycle * perLevel;
    levels.push(shuffled.slice(start, start + perLevel));
  }
  return levels;
};

const grammarLevels = buildLevels(grammarQuestions);
const vocabularyLevels = buildLevels(vocabularyQuestions);
const listeningLevels = buildLevels(listeningQuestions);
const pronunciationLevels = buildLevels(pronunciationQuestions);
const dailyPracticeLevels = buildLevels(dailyPracticeQuestions);
const quizContent = {
  grammar: grammarLevels,
  vocabulary: vocabularyLevels,
  listening: listeningLevels,
  pronunciation: pronunciationLevels,
  dailyPractice: dailyPracticeLevels,
};

module.exports = quizContent;