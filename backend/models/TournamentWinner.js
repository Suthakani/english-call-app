const mongoose = require("mongoose");

const tournamentWinnerSchema = new mongoose.Schema(
  {
    periodType: { type: String, enum: ["weekly", "monthly", "yearly"], required: true },
    periodKey: { type: String, required: true }, // e.g. "2026-W37", "2026-09", "2026"
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    winners: [
      {
        rank: { type: Number, required: true }, // 1-10
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: { type: String },
        avatarUrl: { type: String },
        points: { type: Number },
        certId: { type: String },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

// One finalized record per type+period.
tournamentWinnerSchema.index({ periodType: 1, periodKey: 1 }, { unique: true });

module.exports = mongoose.model("TournamentWinner", tournamentWinnerSchema);