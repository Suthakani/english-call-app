const User = require("../models/User");
const categories = require("../data/categories");
const { getWeeklyCompletedCount, logActivity } = require("./activityController");
const VocabWord = require("../models/VocabWord");
const ConversationSession = require("../models/ConversationSession");
const ActivityLog = require("../models/ActivityLog");
const toDateOnly = (d) => {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const MAX_FREEZE_CAP = 3;

// Milestones awarded once per streak "run" — when streakDays lands
// exactly on one of these numbers, grant the freeze bonus, capped so
// stockpiling freezes doesn't remove all risk from missing a day.
const STREAK_MILESTONES = { 7: 1, 30: 2, 100: 5 };

const touchStreak = async (user) => {
  const today = toDateOnly(new Date());

  if (!user.lastActiveDate) {
    user.streakDays = 1;
    user.lastActiveDate = today;
    await user.save();
    return user;
  }

  const last = toDateOnly(user.lastActiveDate);
  const diffDays = Math.round((today - last) / MS_PER_DAY);

  if (diffDays === 0) return user;

  if (diffDays === 1) {
    user.streakDays += 1;
  } else if (diffDays > 1) {
    const missed = diffDays - 1; // number of days skipped
    if ((user.streakFreezeCount || 0) >= missed) {
      // one freeze covers each missed day, streak continues
      user.streakFreezeCount -= missed;
      user.streakFreezeUsedDate = new Date(today.getTime() - MS_PER_DAY).toISOString().slice(0, 10);
      user.streakDays += 1;
    } else {
      user.streakDays = 1; // not enough freezes, streak restarts
    }
  }
  // Award a milestone freeze bonus the day the streak lands exactly on
  // 7 / 30 / 100, respecting the max stockpile cap.
  const bonus = STREAK_MILESTONES[user.streakDays];
  if (bonus) {
    user.streakFreezeCount = Math.min(MAX_FREEZE_CAP, (user.streakFreezeCount || 0) + bonus);
  }

  user.lastActiveDate = today;
  await user.save();
  return user;
};
const getProfile = async (req, res) => {
  try {
    const user = await touchStreak(req.user);
    res.json({
      username: user.username,
      email: user.email,
      nativeLanguage: user.nativeLanguage,
      level: user.level,
      avatarUrl: user.avatarUrl,
      avatarConfig: user.avatarConfig,
      streakDays: user.streakDays,
      streakFreezeCount: user.streakFreezeCount,
      streakFreezeUsedDate: user.streakFreezeUsedDate,
      role: user.role,
      profileComplete: user.profileComplete, // NEW — so a page reload doesn't lose this
      championBadges: user.championBadges || [],
      certificates: user.certificates || [],
      masteredCategories: user.masteredCategories || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load profile", error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, nativeLanguage, avatarUrl, avatarConfig, reminderTime } = req.body;
const update = {};
if (username !== undefined) update.username = username;
if (nativeLanguage !== undefined) update.nativeLanguage = nativeLanguage;
if (avatarUrl !== undefined) update.avatarUrl = avatarUrl;
if (avatarConfig !== undefined) update.avatarConfig = avatarConfig;
if (reminderTime !== undefined) update.reminderTime = reminderTime;
    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    });

    res.json({
      username: user.username,
      email: user.email,
      nativeLanguage: user.nativeLanguage,
      level: user.level,
      avatarUrl: user.avatarUrl,
      avatarConfig: user.avatarConfig,
      streakDays: user.streakDays,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "That username is already taken" });
    }
    res.status(500).json({ message: "Could not update profile", error: error.message });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image received" });

    const base64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${base64}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl: dataUri },
      { new: true }
    );

    res.json({ avatarUrl: user.avatarUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not upload avatar", error: error.message });
  }
};

// A category counts as "completed" once the user has done a handful of
// turns in it — 5 is an arbitrary but reasonable bar for "actually
// practiced this", tweak freely.
const TURNS_TO_COMPLETE = 5;

const getProgress = async (req, res) => {
  try {
    const user = await touchStreak(req.user);
    const allCategoryKeys = Object.keys(categories);

    const practicedKeys = new Set(user.categoryProgress.map((c) => c.category));

    const completedCategories = user.categoryProgress.map((c) => ({
      title: categories[c.category]?.title || c.category,
      lessonsDone: Math.min(c.turnsCompleted, TURNS_TO_COMPLETE),
      lessonsTotal: TURNS_TO_COMPLETE,
    }));

    const untried = allCategoryKeys.filter((k) => !practicedKeys.has(k));
    const preferred = (user.preferredCategories || []).filter((k) => untried.includes(k));
    const rest = untried.filter((k) => !preferred.includes(k));
    const recommendedKeys = [...preferred, ...rest].slice(0, 3);

    const recommendedNext = recommendedKeys.map((k) => ({
      slug: k,
      title: categories[k]?.title || k,
      reason: preferred.includes(k) ? "Matches your interests" : "Try something new",
    }));

   const weeklyCompleted = await getWeeklyCompletedCount(user._id);

    // Award a freeze bonus the first time the user's weekly goal is fully
    // met this week (weekStartStr keeps this idempotent — won't re-award
    // on every subsequent request the same week).
    const dayOfWeek = new Date().getDay();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - dayOfWeek);
    const weekStartStr = weekStart.toISOString().slice(0, 10);

    if (
      weeklyCompleted >= user.weeklyGoalTarget &&
      user.lastWeeklyFreezeAwardWeek !== weekStartStr &&
      user.streakFreezeCount < MAX_FREEZE_CAP
    ) {
      user.streakFreezeCount = Math.min(MAX_FREEZE_CAP, user.streakFreezeCount + 1);
      user.lastWeeklyFreezeAwardWeek = weekStartStr;
      await user.save();
    }
    res.json({
      streakDays: user.streakDays,
      lessonsCompleted: user.categoryProgress.filter((c) => c.turnsCompleted >= TURNS_TO_COMPLETE).length,
      totalLessons: allCategoryKeys.length,
      completedCategories,
      recommendedNext,
      weeklyGoal: { completed: weeklyCompleted, target: user.weeklyGoalTarget },
      personalBests: user.personalBests,
      streakFreezeCount: user.streakFreezeCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load progress", error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please fill in both fields" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update password", error: error.message });
  }
};
// @route DELETE /api/user/account
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    await VocabWord.deleteMany({ user: req.user._id });
    await ConversationSession.deleteMany({ user: req.user._id });
    await ActivityLog.deleteMany({ user: req.user._id });
    res.json({ message: "Account deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not delete account", error: error.message });
  }
};

// @route GET /api/user/export
const exportUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password").lean();
    const vocabulary = await VocabWord.find({ user: req.user._id }).lean();
    const callSessions = await ConversationSession.find({ user: req.user._id }).lean();
    const activityLog = await ActivityLog.find({ user: req.user._id }).lean();

    res.json({ profile: user, vocabulary, callSessions, activityLog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not export data", error: error.message });
  }
};
// Called once per day when a logged-in user visits the homepage.
// Reuses the same touchStreak logic as getProfile/getProgress.
const pingActivity = async (req, res) => {
  try {
    const user = await touchStreak(req.user);
    await logActivity(req.user._id);
    res.json({ streakDays: user.streakDays });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update activity", error: error.message });
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar, getProgress, changePassword, pingActivity, deleteAccount, exportUserData };