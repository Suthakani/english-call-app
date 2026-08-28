const User = require("../models/User");

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
  points: u.points ?? 0,
  totalSessions: u.totalSessions,
  level: u.level,
  isYou: req.user && String(u._id) === String(req.user._id),
}));

    let you = leaderboard.find(row => row.isYou) || null;

    // If the current user didn't make the top N, work out their real rank
    // separately: count how many verified users rank strictly above them.
    if (!you && req.user) {
      const me = await User.findById(req.user._id).select("username avatarUrl streakDays totalSessions level").lean();
      if (me) {
        const higherCount = await User.countDocuments({
          isVerified: true,
          $or: [
            { streakDays: { $gt: me.streakDays } },
            { streakDays: me.streakDays, totalSessions: { $gt: me.totalSessions } },
          ],
        });
        you = {
          rank: higherCount + 1,
          userId: me._id,
          username: me.username,
          avatarUrl: me.avatarUrl,
          streakDays: me.streakDays,
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

module.exports = { getLeaderboard };