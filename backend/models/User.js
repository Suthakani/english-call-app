const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    authProvider: { type: String, enum: ["email", "google"], default: "email" },
    profileComplete: { type: Boolean, default: true },
    nativeLanguage: { type: String, default: "Tamil" },
    gender: { type: String, enum: ["female", "male", "neutral"], default: "neutral" },

    isVerified: { type: Boolean, default: false },
    verificationOTP: { type: String },
    verificationOTPExpires: { type: Date },

    level: {
      type: String,
      enum: ["unassigned", "basic", "intermediate", "advanced"],
      default: "unassigned",
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    preferredCategories: [{ type: String }],

    totalSessions: { type: Number, default: 0 },
    totalMistakesCorrected: { type: Number, default: 0 },

    avatarUrl: { type: String, default: "" },
    avatarConfig: { type: mongoose.Schema.Types.Mixed, default: null }, // NEW — react-nice-avatar customization object

    streakDays: { type: Number, default: 0 },
    
points: { type: Number, default: 0 },
quizLevels: {
  grammar: { type: Number, default: 1 },
  vocabulary: { type: Number, default: 1 },
  listening: { type: Number, default: 1 },
  pronunciation: { type: Number, default: 1 },
  "daily-practice": { type: Number, default: 1 },
  speaking: { type: Number, default: 1 }, // NEW — level progress for the call-practice leveled system
},
wonCycles: [{ type: Number }],
championBadges: [
  {
    cycleIndex: { type: Number, required: true },
    cycleStart: { type: Date },
    cycleEnd: { type: Date },
    points: { type: Number },
    awardedAt: { type: Date, default: Date.now },
    _id: false,
  },
],
unseenWinCycle: { type: Number, default: null },
lastSeenEventKey: { type: String, default: null },
lastActiveDate: { type: Date, default: null },
streakFreezeCount: { type: Number, default: 1 }, // NEW — starts with 1 free freeze
streakFreezeUsedDate: { type: String, default: null }, // NEW — YYYY-MM-DD when freeze was consumed
lastWeeklyFreezeAwardWeek: { type: String, default: null },
lastReminderSentAt: { type: Date, default: null },
lastEventReminderKey: { type: String, default: null },
    // Per-category practice tracking, so the profile page can show
    // "what you've learned" and recommend categories not tried yet.
    categoryProgress: [
      {
        category: { type: String, required: true }, // matches a key in data/categories.js
        turnsCompleted: { type: Number, default: 0 }, // number of AI conversation turns in this category
        lastPracticed: { type: Date, default: Date.now },
        _id: false,
      },
    ],

    // NEW — how many distinct days per week the user wants to practice.
    // "Completed" (days actually active this week) is computed on the fly
    // from ActivityLog, not stored here.
    weeklyGoalTarget: { type: Number, default: 5, min: 1, max: 7 },
    reminderTime: { type: String, default: "19:00" },

    // NEW — personal-best stats shown on the profile Overview tab.
    // longestStreak is updated whenever streakDays increases past it;
    // mostWordsInOneCall / longestCallMinutes are updated when a call
    // session is saved (see sessionController.saveSession);
    // bestChallengeScore is updated when a daily challenge is graded.
    personalBests: {
      longestStreak: { type: Number, default: 0 },
      mostWordsInOneCall: { type: Number, default: 0 },
      longestCallMinutes: { type: Number, default: 0 },
      bestChallengeScore: { type: Number, default: 0 },
    },
  
certificates: [
  {
    category: { type: String }, // now optional — only set for quiz-level certs
    type: { type: String, enum: ["quiz", "champion", "tournament", "hall-of-fame", "event"], default: "quiz" }, // NEW
    cycleIndex: { type: Number }, // set only when type === "champion"
    periodType: { type: String }, // set only when type === "tournament" ("weekly"/"monthly"/"yearly")
    periodKey: { type: String }, // set for type === "tournament" or "hall-of-fame"
    rank: { type: Number }, // set for type === "tournament" (1-10) or "hall-of-fame" (always 1)
    issuedAt: { type: Date, default: Date.now },
    // NEW — stable, unique certificate ID used for QR-code verification.
    // Computed once at issuance (see quizController.completeLevel) and
    // never changes afterwards, so a printed/downloaded certificate's QR
    // code keeps working forever, even if the ID-generation formula
    // changes later. Indexed (non-unique — legacy certs before this field
    // existed will have it backfilled lazily) so verifyCertificate can
    // look a certificate up by certId alone, without needing a userId.
    certId: { type: String, index: true },
    _id: false,
  },
],
    // NEW — stable referral code, generated once at signup. Used to build
    // the "Invite Friends" link on the profile page.
    masteredCategories: [{ type: String }],

    // NEW — stable referral code, generated once at signup. Used to build
    // the "Invite Friends" link on the profile page.
    referralCode: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Generate a referral code once, on first save, for users who don't have
  // one yet (new signups, and existing users the first time they're saved
  // after this field was added).
  if (!this.referralCode) {
    const base = (this.username || "USER").replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "USER";
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.referralCode = `${base}-${suffix}`;
  }

  // Keep personalBests.longestStreak in sync whenever streakDays grows past it.
  if (this.isModified("streakDays")) {
    this.personalBests = this.personalBests || {};
    if (this.streakDays > (this.personalBests.longestStreak || 0)) {
      this.personalBests.longestStreak = this.streakDays;
    }
  }

  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);