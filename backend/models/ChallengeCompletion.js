const mongoose = require('mongoose');

const challengeCompletionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // 'YYYY-MM-DD', local day the challenge was for
  slug: { type: String, required: true },
  answers: [{ questionId: String, text: String }],
  score: { type: Number, required: true },      // e.g. 4
  maxScore: { type: Number, required: true },    // e.g. 5
  passed: { type: Boolean, required: true },     // score/maxScore >= 0.6 (tune as needed)
  badgeAwarded: { type: String, default: null }, // 'daily-challenge' badge id, if passed
}, { timestamps: true });

challengeCompletionSchema.index({ user: 1, date: 1, slug: 1 }, { unique: true }); // one attempt per challenge per day

module.exports = mongoose.model('ChallengeCompletion', challengeCompletionSchema);