// Fixed 10-day competition cycles, anchored to a fixed start date so every
// user sees the same cycle boundaries (Cycle 1 = day 1-10, Cycle 2 = day
// 11-20, etc.) regardless of when they signed up.
//
// Change CYCLE_START_DATE only if you want to reset the numbering — doing
// so after cycles have already been recorded will make old CycleWinner
// records' cycleIndex values stop matching newly computed indices.
const CYCLE_LENGTH_DAYS = 10;
const CYCLE_START_DATE = new Date('2026-08-30T00:00:00Z');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Returns the 0-based index of the cycle that `date` falls in (defaults to now).
const getCycleIndex = (date = new Date()) => {
  const diffMs = date.getTime() - CYCLE_START_DATE.getTime();
  const diffDays = Math.floor(diffMs / MS_PER_DAY);
  return Math.floor(diffDays / CYCLE_LENGTH_DAYS);
};

// Returns { start, end } Date objects for the given cycle index.
// `end` is exclusive (the instant the next cycle begins).
const getCycleBounds = (cycleIndex) => {
  const start = new Date(CYCLE_START_DATE.getTime() + cycleIndex * CYCLE_LENGTH_DAYS * MS_PER_DAY);
  const end = new Date(start.getTime() + CYCLE_LENGTH_DAYS * MS_PER_DAY);
  return { start, end };
};

// A cycle is "finalizable" once its end boundary has passed.
const isCycleComplete = (cycleIndex) => {
  const { end } = getCycleBounds(cycleIndex);
  return new Date() >= end;
};

module.exports = { CYCLE_LENGTH_DAYS, getCycleIndex, getCycleBounds, isCycleComplete };