const mongoose = require('mongoose');

const peerSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  mode: { type: String, enum: ['text', 'voice', 'both'], default: 'both' },
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('PeerSession', peerSessionSchema);