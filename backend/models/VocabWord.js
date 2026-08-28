const mongoose = require("mongoose");

const vocabWordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    word: { type: String, required: true, trim: true },
    meaning: { type: String, required: true },
    example: { type: String, default: "" },
    status: { type: String, enum: ["learning", "known"], default: "learning" },
  },
  { timestamps: true }
);

// Same word shouldn't be saved twice for the same user (case-insensitive).
vocabWordSchema.index({ user: 1, word: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });

module.exports = mongoose.model("VocabWord", vocabWordSchema);