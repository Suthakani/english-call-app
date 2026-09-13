const mongoose = require('mongoose');

const matchRequestSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mode: { type: String, enum: ['text', 'voice', 'both'], default: 'both' },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'cancelled', 'expired'], default: 'pending' },
  sessionId: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('MatchRequest', matchRequestSchema);