const mongoose = require('mongoose');

const userChallengeStateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  order: { type: [String], required: true },       // shuffled list of challenge slugs for this cycle
  position: { type: Number, required: true, default: 0 }, // index into `order` for the current cycle
  lastAssignedDate: { type: String, required: true }, // 'YYYY-MM-DD'
  lastAssignedSlug: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('UserChallengeState', userChallengeStateSchema);