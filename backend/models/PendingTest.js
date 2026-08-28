const mongoose = require("mongoose");

const pendingTestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  language: { type: String, required: true },
  questions: [
    {
      id: String,
      sentence: String, // sentence in the user's native language
      referenceEnglish: String, // correct English translation (kept server-side)
      difficulty: { type: String, enum: ["basic", "intermediate", "advanced"] },
    },
  ],
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // auto-delete after 1 hour if unused
});

module.exports = mongoose.model("PendingTest", pendingTestSchema);