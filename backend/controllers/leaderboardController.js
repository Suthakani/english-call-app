const User = require("../models/User");
const CycleWinner = require("../models/CycleWinner");
const { getCycleIndex, getCycleBounds, isCycleComplete } = require("../utils/cycleUtils");

// @route GET /api/leaderboard?limit=20
// Returns the top N users ranked by streakDays (desc), tie-broken by
// totalSessions (desc) — both fields already live on User, no extra
// tracking needed. Never exposes email/password; only what's safe to show
// publicly (username, avatar, streak, sessions).
//
// Also returns the requesting user's own rank + stats even if they're
// outside the top N, so the page can show "You're #47" instead of nothing.
const getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const topUsers = await User.find({ isVerified: true })
      .sort({ points: -1, streakDays: -1, totalSessions: -1 })
      .limit(limit)
      .select("username avatarUrl streakDays totalSessions level points")
      .lean();

    const leaderboard = topUsers.map((u, i) => ({
      rank: i + 1,
      userId: u._id,
      username: u.username,
      avatarUrl: u.avatarUrl,
      streakDays: u.streakDays,
      points: u.points,
      totalSessions: u.totalSessions,
      level: u.level,
      isYou: req.user && String(u._id) === String(req.user._id),
    }));

    let you = leaderboard.find(row => row.isYou) || null;

    if (!you && req.user) {
      const me = await User.findById(req.user._id).select("username avatarUrl streakDays totalSessions level points").lean();
      if (me) {
        const higherCount = await User.countDocuments({
          isVerified: true,
          $or: [
            { points: { $gt: me.points || 0 } },
            { points: me.points || 0, streakDays: { $gt: me.streakDays } },
          ],
        });
        you = {
          rank: higherCount + 1,
          userId: me._id,
          username: me.username,
          avatarUrl: me.avatarUrl,
          streakDays: me.streakDays,
          points: me.points,
          totalSessions: me.totalSessions,
          level: me.level,
          isYou: true,
          outsideTop: true,
        };
      }
    }

    res.json({ leaderboard, you });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load leaderboard", error: error.message });
  }
};

// Finalizes every past cycle that has ended but doesn't have a CycleWinner
// record yet — handles the case where the server was down or nobody
// checked in right at a cycle boundary. Lazy/on-demand instead of a cron
// job: called from checkWinnerPopup, which runs on every app load.
const finalizePastCyclesIfNeeded = async () => {
  const currentIndex = getCycleIndex();
  const latest = await CycleWinner.findOne().sort({ cycleIndex: -1 }).lean();
  const nextToFinalize = latest ? latest.cycleIndex + 1 : 0;

  for (let idx = nextToFinalize; idx < currentIndex; idx++) {
    if (!isCycleComplete(idx)) break; // shouldn't happen given idx < currentIndex, but stay safe



    const key = `cyclePoints.${idx}`;

    const top = await User.findOne({ isVerified: true, [key]: { $gt: 0 } })
      .sort({ [key]: -1, streakDays: -1 })
      .select("username avatarUrl cyclePoints")
      .lean();

    if (!top) continue; // yaarum point edukkala, winner illa

    const cyclePts = top.cyclePoints?.[idx] || 0;

    const { start, end } = getCycleBounds(idx);

    // Guard: if two requests race, the unique index on cycleIndex makes the
    // second create fail, and we skip instead of double-awarding.
    try {
      await CycleWinner.create({
        cycleIndex: idx,
        cycleStart: start,
        cycleEnd: end,
        user: top._id,
        username: top.username,
        avatarUrl: top.avatarUrl,
                points: cyclePts,
      });
    } catch (e) {
      if (e.code === 11000) continue;
      throw e;
    }

        const ymd = new Date(end.getTime() - 1).toISOString().slice(0, 10).replace(/-/g, "");
    const certId = `CHAMP-${idx + 1}-${top._id.toString().slice(-6).toUpperCase()}-${ymd}`;
    // e.g. CHAMP-2-6518AF-20260919

       await User.findByIdAndUpdate(top._id, {
      $inc: { streakFreezeCount: 3 },
      $push: {
        wonCycles: idx,
        championBadges: { cycleIndex: idx, cycleStart: start, cycleEnd: end, points: cyclePts },
        certificates: { type: "champion", cycleIndex: idx, certId },
      },
      $set: { unseenWinCycle: idx },
    });
  }   // <- for loop close
};    // <- function close

// @route GET /api/leaderboard/winner-popup

// @route GET /api/leaderboard/winner-popup
// Finalizes any overdue cycles, then tells the frontend whether THIS user
// has an unseen win to celebrate. Call this once when the app loads.
const checkWinnerPopup = async (req, res) => {
  try {
    await finalizePastCyclesIfNeeded();

    const user = await User.findById(req.user._id).select("unseenWinCycle").lean();
    if (user?.unseenWinCycle === null || user?.unseenWinCycle === undefined) {
      return res.json({ show: false });
    }

    const record = await CycleWinner.findOne({ cycleIndex: user.unseenWinCycle }).lean();
    if (!record) return res.json({ show: false });

    res.json({
      show: true,
      cycleIndex: record.cycleIndex,
      cycleStart: record.cycleStart,
      cycleEnd: record.cycleEnd,
      points: record.points,
      rewards: record.rewards,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not check winner status", error: error.message });
  }
};

// @route POST /api/leaderboard/winner-popup/seen
// Called after the popup has been shown, so it doesn't show again.
const markWinnerPopupSeen = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { unseenWinCycle: null } });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update popup status", error: error.message });
  }
};

// @route GET /api/leaderboard/winners
// Public-ish list of every past cycle's winner, most recent first.
const getWinnersList = async (req, res) => {
  try {
    await finalizePastCyclesIfNeeded();

    const winners = await CycleWinner.find()
      .sort({ cycleIndex: -1 })
      .limit(50)
      .lean();

    res.json(winners.map(w => ({
      cycleIndex: w.cycleIndex,
      cycleStart: w.cycleStart,
      cycleEnd: w.cycleEnd,
      username: w.username,
      avatarUrl: w.avatarUrl,
      points: w.points,
      rewards: w.rewards,
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load winners list", error: error.message });
  }
};

module.exports = { getLeaderboard, checkWinnerPopup, markWinnerPopupSeen, getWinnersList };