const mongoose = require("mongoose");

const conversationSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    durationMinutes: { type: Number, default: 0 },
    correctionsCount: { type: Number, default: 0 },
    wordsSpoken: { type: Number, default: 0 }, // total words across the user's turns, for the "Most words in one call" personal best
    transcript: [
      {
        role: { type: String, enum: ["You", "AI"], required: true },
        text: { type: String, required: true },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConversationSession", conversationSessionSchema);