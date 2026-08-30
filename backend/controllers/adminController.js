const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const ContactSubmission = require("../models/ContactSubmission");
const ChallengeCompletion = require("../models/ChallengeCompletion");
const ConversationSession = require("../models/ConversationSession");
const VocabWord = require("../models/VocabWord");
const { sendReminderEmail } = require("../utils/sendEmail");
const getOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isVerified: true });

    const today = new Date().toISOString().slice(0, 10);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeToday = await ActivityLog.countDocuments({
      date: today,
      count: { $gt: 0 },
    });

    const newSignupsThisWeek = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const avgStreakResult = await User.aggregate([
      { $match: { isVerified: true } },
      { $group: { _id: null, avgStreak: { $avg: "$streakDays" } } },
    ]);
    const avgStreak = avgStreakResult[0]?.avgStreak || 0;

    const avgSessionsResult = await User.aggregate([
      { $match: { isVerified: true } },
      { $group: { _id: null, avgSessions: { $avg: "$totalSessions" } } },
    ]);
    const avgSessions = avgSessionsResult[0]?.avgSessions || 0;
    const totalSecondsResult = await ActivityLog.aggregate([
      { $group: { _id: null, totalSeconds: { $sum: "$secondsSpent" } } },
    ]);
    const totalMinutesSpent = Math.round((totalSecondsResult[0]?.totalSeconds || 0) / 60);
    res.json({
      totalUsers,
      activeToday,
      newSignupsThisWeek,
      avgStreak: Math.round(avgStreak * 10) / 10,
      avgSessions: Math.round(avgSessions * 10) / 10,
      totalMinutesSpent,
    });
  } catch (error) {
    res.status(500).json({ message: "Error loading overview", error: error.message });
  }
};

const getCategoryPopularity = async (req, res) => {
  try {
    const result = await User.aggregate([
      { $unwind: "$categoryProgress" },
      {
        $group: {
          _id: "$categoryProgress.category",
          totalTurns: { $sum: "$categoryProgress.turnsCompleted" },
          userCount: { $sum: 1 },
        },
      },
      { $sort: { totalTurns: -1 } },
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error loading category stats", error: error.message });
  }
};

// @route GET /api/admin/users?page=1&limit=20&sortBy=streakDays&search=sk
const getAllUsersWithSearch = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const sortBy = req.query.sortBy || "createdAt";
    const search = (req.query.search || "").trim();

    const filter = { isVerified: true };
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .sort({ [sortBy]: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("username email streakDays totalSessions points level createdAt lastActiveDate")
      .lean();

    const total = await User.countDocuments(filter);

    res.json({ users, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Error loading users", error: error.message });
  }
};

// @route GET /api/admin/user/:id/full
const getUserFullDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const [activityLogs, sessions, vocab] = await Promise.all([
      ActivityLog.find({ user: req.params.id }).sort({ date: -1 }).limit(30).lean(),
      ConversationSession.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(10).lean(),
      VocabWord.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    res.json({ user, activityLogs, sessions, vocab });
  } catch (error) {
    res.status(500).json({ message: "Error loading user detail", error: error.message });
  }
};

// @route GET /api/admin/at-risk
// "At risk" = has practiced before, but no ActivityLog entry (real
// practice turn) in the last 3 days — more accurate than lastActiveDate,
// which updates just from opening the homepage.
const getAtRiskUsers = async (req, res) => {
  try {
    const threeDaysAgoStr = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    // Users who have practiced at all
    const activeUsers = await User.find({ isVerified: true, totalSessions: { $gt: 0 } })
  .select("username email streakDays totalSessions level lastActiveDate lastReminderSentAt")
  .lean();

    if (!activeUsers.length) return res.json([]);

    // Find their most recent ActivityLog date in one query
    const recentLogs = await ActivityLog.aggregate([
      { $match: { user: { $in: activeUsers.map((u) => u._id) } } },
      { $group: { _id: "$user", lastPracticeDate: { $max: "$date" } } },
    ]);
    const lastPracticeMap = new Map(recentLogs.map((r) => [String(r._id), r.lastPracticeDate]));

    const atRisk = activeUsers
      .map((u) => {
        const lastPractice = lastPracticeMap.get(String(u._id));
        return { ...u, lastPractice: lastPractice || null };
      })
      .filter((u) => !u.lastPractice || u.lastPractice < threeDaysAgoStr)
      .map((u) => {
        const daysInactive = u.lastPractice
          ? Math.floor((Date.now() - new Date(u.lastPractice).getTime()) / (1000 * 60 * 60 * 24))
          : null;
        return { ...u, daysInactive };
      })
      .sort((a, b) => (b.daysInactive || 999) - (a.daysInactive || 999));

    res.json(atRisk);
  } catch (error) {
    res.status(500).json({ message: "Error loading at-risk users", error: error.message });
  }
};

// @route GET /api/admin/level-distribution
const getLevelDistribution = async (req, res) => {
  try {
    const result = await User.aggregate([
      { $match: { isVerified: true } },
      { $group: { _id: "$level", count: { $sum: 1 } } },
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error loading level distribution", error: error.message });
  }
};

// @route GET /api/admin/contact-submissions
const getContactSubmissions = async (req, res) => {
  try {
    const submissions = await ContactSubmission.find().sort({ createdAt: -1 }).limit(200).lean();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error loading contact submissions", error: error.message });
  }
};

// @route PATCH /api/admin/contact-submissions/:id  { status: "resolved" }
const updateContactSubmission = async (req, res) => {
  try {
    const updated = await ContactSubmission.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: "Submission not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating submission", error: error.message });
  }
};

// @route GET /api/admin/challenge-stats
// @route GET /api/admin/challenge-stats
const getChallengeStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isVerified: true });
    const totalCompletions = await ChallengeCompletion.countDocuments();
    const completionRate = totalUsers ? Math.round((totalCompletions / totalUsers) * 100) : 0;

    const avgScoreResult = await ChallengeCompletion.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$score" } } },
    ]);
    const avgScore = Math.round((avgScoreResult[0]?.avgScore || 0) * 10) / 10;

    const badgeCount = await ChallengeCompletion.countDocuments({ badgeAwarded: { $ne: null } });
    const badgeRate = totalCompletions ? Math.round((badgeCount / totalCompletions) * 100) : 0;

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const trend = await ChallengeCompletion.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          completions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      completionRate,
      avgScore,
      badgeRate,
      dailyTrend: trend.map((t) => ({ date: t._id, completions: t.completions })),
    });
  } catch (error) {
    res.status(500).json({ message: "Error loading challenge stats", error: error.message });
  }
};

// @route GET /api/admin/vocab-stats
const getVocabStats = async (req, res) => {
  try {
    const totalSaves = await VocabWord.countDocuments();
    const topWords = await VocabWord.aggregate([
      { $group: { _id: "$word", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json({
      totalSaves,
      topWords: topWords.map((w) => ({ word: w._id, count: w.count })),
    });
  } catch (error) {
    res.status(500).json({ message: "Error loading vocab stats", error: error.message });
  }
};

// @route GET /api/admin/level-test-stats
const getLevelTestStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isVerified: true });
    const unassignedCount = await User.countDocuments({ isVerified: true, level: "unassigned" });
    const completionRate = totalUsers
      ? Math.round(((totalUsers - unassignedCount) / totalUsers) * 100)
      : 0;
    res.json({ unassignedCount, completionRate });
  } catch (error) {
    res.status(500).json({ message: "Error loading level test stats", error: error.message });
  }
};

// @route GET /api/admin/dau-trend
const getDauTrend = async (req, res) => {
  try {
    const fourteenDaysAgoStr = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const trend = await ActivityLog.aggregate([
      { $match: { date: { $gte: fourteenDaysAgoStr }, count: { $gt: 0 } } },
      { $group: { _id: "$date", users: { $addToSet: "$user" } } },
      { $project: { _id: 1, count: { $size: "$users" } } },
      { $sort: { _id: 1 } },
    ]);

    res.json(trend.map((t) => ({ date: t._id, count: t.count })));
  } catch (error) {
    res.status(500).json({ message: "Error loading DAU trend", error: error.message });
  }
};

// @route GET /api/admin/language-breakdown
const getLanguageBreakdown = async (req, res) => {
  try {
    const breakdown = await User.aggregate([
      { $match: { isVerified: true } },
      { $group: { _id: "$nativeLanguage", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(breakdown.map((b) => ({ language: b._id || "Unknown", count: b.count })));
  } catch (error) {
    res.status(500).json({ message: "Error loading language breakdown", error: error.message });
  }
};

// @route GET /api/admin/login-method-split
const getLoginMethodSplit = async (req, res) => {
  try {
    const google = await User.countDocuments({ isVerified: true, authProvider: "google" });
    const email = await User.countDocuments({
      isVerified: true,
      authProvider: { $ne: "google" },
    });
    res.json({ google, email });
  } catch (error) {
    res.status(500).json({ message: "Error loading login method split", error: error.message });
  }
};
const REMINDER_COOLDOWN_HOURS = 24;

// @route POST /api/admin/send-reminder/:userId
const sendReminderToUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.lastReminderSentAt) {
      const hoursSince = (Date.now() - new Date(user.lastReminderSentAt).getTime()) / (1000 * 60 * 60);
      if (hoursSince < REMINDER_COOLDOWN_HOURS) {
        const hoursLeft = Math.ceil(REMINDER_COOLDOWN_HOURS - hoursSince);
        return res.status(429).json({ message: `Reminder already sent recently. Try again in ${hoursLeft}h.` });
      }
    }

    await sendReminderEmail(user.email, user.username, user.streakDays);
    user.lastReminderSentAt = new Date();
    await user.save();

    res.json({ message: "Reminder sent", lastReminderSentAt: user.lastReminderSentAt });
  } catch (error) {
    res.status(500).json({ message: "Error sending reminder", error: error.message });
  }
};

// @route POST /api/admin/send-reminders-bulk  { userIds: [...] }
const sendReminderBulk = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "userIds array required" });
    }

    const users = await User.find({ _id: { $in: userIds } });
    const now = Date.now();
    const results = { sent: 0, skipped: 0 };

    for (const user of users) {
      if (user.lastReminderSentAt) {
        const hoursSince = (now - new Date(user.lastReminderSentAt).getTime()) / (1000 * 60 * 60);
        if (hoursSince < REMINDER_COOLDOWN_HOURS) {
          results.skipped++;
          continue;
        }
      }
      try {
        await sendReminderEmail(user.email, user.username, user.streakDays);
        user.lastReminderSentAt = new Date();
        await user.save();
        results.sent++;
      } catch (err) {
        results.skipped++;
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Error sending bulk reminders", error: error.message });
  }
};
module.exports = {
  getOverview,
  getCategoryPopularity,
  getAllUsers: getAllUsersWithSearch,
  getUserDetail: getUserFullDetail,
  getAtRiskUsers,
  getLevelDistribution,
  getContactSubmissions,
  updateContactSubmission,
  getChallengeStats,
  getVocabStats,
  getLevelTestStats,
  getDauTrend,
  getLanguageBreakdown,
  getLoginMethodSplit,
  sendReminderToUser,
  sendReminderBulk,
};