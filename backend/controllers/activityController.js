const ActivityLog = require("../models/ActivityLog");

const todayStr = () => new Date().toISOString().slice(0, 10);

// Call this from wherever a "practice" event actually happens on the
// backend — the /conversation/turn handler (after a successful AI reply)
// and the daily challenge submit handler are the two natural call sites.
// Exported so other controllers can `require("./activityController").logActivity(userId)`
// instead of duplicating the upsert logic.
const logActivity = async userId => {
  try {
    await ActivityLog.findOneAndUpdate(
      { user: userId, date: todayStr() },
      { $inc: { count: 1 } },
      { upsert: true }
    );
  } catch (err) {
    // Activity logging should never break the actual practice flow —
    // log and swallow rather than letting this fail the calling request.
    console.error("Failed to log activity:", err.message);
  }
};
// Adds real practice-time (in seconds) to today's ActivityLog row.
// Called from sessionController when a call session is saved, so the
// time comes from actual measured call duration, not a client-side timer
// that could be spoofed or lost on tab close.
const addTimeSpent = async (userId, seconds) => {
  if (!seconds || seconds <= 0) return;
  try {
    await ActivityLog.findOneAndUpdate(
      { user: userId, date: todayStr() },
      { $inc: { secondsSpent: seconds } },
      { upsert: true }
    );
  } catch (err) {
    console.error("Failed to log time spent:", err.message);
  }
};
// @route GET /api/user/activity?days=90
// Returns [{ date: 'YYYY-MM-DD', count }] for the requested trailing window
// (defaults to 90 days — enough for the 12-week heatmap on the frontend).
const getActivity = async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 90, 365);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().slice(0, 10);

    const rows = await ActivityLog.find({
      user: req.user._id,
      date: { $gte: sinceStr },
    })
      .select("date count -_id")
      .sort({ date: 1 })
      .lean();

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load activity", error: error.message });
  }
};

// Helper for the weekly-goal calculation: counts distinct active days in
// the current week (Sunday–Saturday, matching the frontend's week logic).
const getWeeklyCompletedCount = async userId => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - dayOfWeek);
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  const count = await ActivityLog.countDocuments({
    user: userId,
    date: { $gte: weekStartStr },
    count: { $gt: 0 },
  });
  return count;
};

module.exports = { getActivity, logActivity, getWeeklyCompletedCount, addTimeSpent };