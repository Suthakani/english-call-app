// backend/utils/tournamentUtils.js
//
// Calendar-based period helpers for the Tournament system (separate from
// the existing arbitrary-length "cycle" system in cycleUtils.js used for
// Champion's Vault). Tournaments run on real calendar weeks/months/years,
// each identified by a stable string key so we don't need a running
// index counter per type.
//
// NOTE (known simplification, consistent with the existing CycleWinner
// logic in leaderboardController.js): rankings are taken from the user's
// current total points at finalization time, not a true point-delta
// snapshot for that exact period. Since finalization happens lazily, the
// first check soon after a period ends, this is a close approximation.

const pad2 = (n) => String(n).padStart(2, "0");

// ISO week number (1-53) for a given date, plus the ISO week-year (which
// can differ from the calendar year in the last/first days of Dec/Jan).
const getISOWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Mon=1 ... Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { isoYear: d.getUTCFullYear(), isoWeek: weekNum };
};

// periodKey formats:
//   weekly:  "2026-W37"
//   monthly: "2026-09"
//   yearly:  "2026"
const getPeriodKey = (type, date = new Date()) => {
  if (type === "weekly") {
    const { isoYear, isoWeek } = getISOWeek(date);
    return `${isoYear}-W${pad2(isoWeek)}`;
  }
  if (type === "monthly") {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
  }
  if (type === "yearly") {
    return `${date.getFullYear()}`;
  }
  throw new Error(`Unknown tournament period type: ${type}`);
};

// Start/end Date objects (UTC) for a given periodKey.
const getPeriodBounds = (type, periodKey) => {
  if (type === "weekly") {
    const [yearStr, weekStr] = periodKey.split("-W");
    const year = parseInt(yearStr, 10);
    const week = parseInt(weekStr, 10);
    // ISO week 1 = the week containing the first Thursday of the year.
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const week1Monday = new Date(jan4);
    week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
    const start = new Date(week1Monday);
    start.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 7);
    return { start, end };
  }
  if (type === "monthly") {
    const [year, month] = periodKey.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    return { start, end };
  }
  if (type === "yearly") {
    const year = parseInt(periodKey, 10);
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));
    return { start, end };
  }
  throw new Error(`Unknown tournament period type: ${type}`);
};

// The most recently COMPLETED period of this type (the one eligible to
// be finalized right now) — i.e. one period key before "today"'s key.
const getPreviousPeriodKey = (type, now = new Date()) => {
  if (type === "weekly") {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - 7);
    return getPeriodKey("weekly", d);
  }
  if (type === "monthly") {
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1));
    return getPeriodKey("monthly", d);
  }
  if (type === "yearly") {
    return String(now.getFullYear() - 1);
  }
  throw new Error(`Unknown tournament period type: ${type}`);
};

module.exports = { getPeriodKey, getPeriodBounds, getPreviousPeriodKey };