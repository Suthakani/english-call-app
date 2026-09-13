const mongoose = require("mongoose");

const eventSubmissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    periodKey: { type: String, required: true },
    objectiveScore: { type: Number, default: 0 },
    objectiveMax: { type: Number, default: 0 },
    writingScore: { type: Number, default: 0 }, // 0-20, AI graded
    totalScore: { type: Number, default: 0 },
    writingText: { type: String },
    writingFeedback: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One attempt per user per event.
eventSubmissionSchema.index({ user: 1, periodKey: 1 }, { unique: true });
eventSubmissionSchema.index({ periodKey: 1, totalScore: -1 }); // fast top-N lookup

module.exports = mongoose.model("EventSubmission", eventSubmissionSchema);