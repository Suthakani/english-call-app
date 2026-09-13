const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    periodKey: { type: String, required: true, unique: true },
    title: { type: String, default: "SpeakUp Proficiency Challenge" },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    status: { type: String, enum: ["upcoming", "live", "closed"], default: "upcoming" },
    winnersFinalized: { type: Boolean, default: false },
    winners: [
      {
        rank: { type: Number },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: { type: String },
        avatarUrl: { type: String },
        score: { type: Number },
        certId: { type: String },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);