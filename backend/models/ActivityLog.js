const mongoose = require("mongoose");

// One document per user per calendar day. `count` increments every time the
// user completes a practice turn or a daily challenge that day — this is
// what powers both the Practice Calendar heatmap and the Weekly Goal ring
// (weekly completed = number of distinct days with count > 0 this week).
const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  count: { type: Number, default: 0 },
  secondsSpent: { type: Number, default: 0 }, // NEW - actual time spent that day
});
activityLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("ActivityLog", activityLogSchema);