const mongoose = require("mongoose");

// One record per finalized 10-day competition cycle.
const cycleWinnerSchema = new mongoose.Schema(
  {
    cycleIndex: { type: Number, required: true, unique: true },
    cycleStart: { type: Date, required: true },
    cycleEnd: { type: Date, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true }, // snapshot, in case the user later renames
    avatarUrl: { type: String, default: "" },
    points: { type: Number, required: true }, // total points at the moment of finalization
    rewards: {
      streakFreezes: { type: Number, default: 3 },
      badge: { type: String, default: "champion" },
      certificateEligible: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CycleWinner", cycleWinnerSchema);