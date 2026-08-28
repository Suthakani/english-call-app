const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    assignedLevel: { type: String, enum: ["basic", "intermediate", "advanced"] },
    answers: [
      {
        questionId: String,
        selected: String,
        correct: String,
        isCorrect: Boolean,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestResult", testResultSchema);
