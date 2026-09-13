const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const MatchRequest = require('../models/MatchRequest');
const PeerSession = require('../models/PeerSession');
const User = require('../models/User');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { isOnline, getOnlineUserIds } = require('../socketServer');

// GET all other users with online status + level
router.get('/online-users', protect, async (req, res) => {
  try {
    const onlineIds = getOnlineUserIds();
    const users = await User.find({ _id: { $ne: req.user._id }, canMatch: { $ne: false } })
      .select('username level');
    const list = users.map(u => ({
      _id: u._id,
      username: u.username,
      level: u.level,
      online: isOnline(u._id.toString()),
    })).sort((a, b) => b.online - a.online); // online users first
    res.json({ users: list });
  } catch (err) {
    res.status(500).json({ message: 'Could not load users', error: err.message });
  }
});

// Send a direct invite to a specific online user
router.post('/invite', protect, async (req, res) => {
  try {
    const { toUserId, mode } = req.body;
    if (!toUserId) return res.status(400).json({ message: 'toUserId is required' });
    if (String(toUserId) === String(req.user._id)) {
      return res.status(400).json({ message: "You can't invite yourself" });
    }
    if (!isOnline(toUserId)) {
      return res.status(400).json({ message: 'That user just went offline — try someone else' });
    }

    const existing = await MatchRequest.findOne({
      fromUser: req.user._id, toUser: toUserId, status: 'pending',
    });
    if (existing) return res.status(400).json({ message: 'You already sent this user a request' });

    const request = await MatchRequest.create({
      fromUser: req.user._id,
      toUser: toUserId,
      mode: mode || 'both',
      status: 'pending',
    });

    const io = req.app.get('io');
    io.to(`user:${toUserId}`).emit('partner:invite', {
      requestId: request._id,
      fromUser: { id: req.user._id, username: req.user.username, level: req.user.level },
      mode: request.mode,
    });

    res.json({ request });
  } catch (err) {
    res.status(500).json({ message: 'Could not send invite', error: err.message });
  }
});

// Respond to an invite (accept/decline)
router.post('/invite/:id/respond', protect, async (req, res) => {
  try {
    const { accept } = req.body;
    const request = await MatchRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (String(request.toUser) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your request to respond to' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'This request is no longer pending' });
    }

    const io = req.app.get('io');

    if (!accept) {
      request.status = 'declined';
      await request.save();
      io.to(`user:${request.fromUser}`).emit('partner:invite-declined', { requestId: request._id });
      return res.json({ message: 'Declined' });
    }

    const sessionId = uuidv4();
    await PeerSession.create({
      sessionId,
      participants: [request.fromUser, request.toUser],
      mode: request.mode,
    });
    request.status = 'accepted';
    request.sessionId = sessionId;
    await request.save();

    io.to(`user:${request.fromUser}`).emit('match:found', { sessionId, mode: request.mode });
    io.to(`user:${request.toUser}`).emit('match:found', { sessionId, mode: request.mode });

    res.json({ message: 'Accepted', sessionId });
  } catch (err) {
    res.status(500).json({ message: 'Could not respond', error: err.message });
  }
});

// Cancel a sent invite (sender changes their mind)
router.post('/invite/:id/cancel', protect, async (req, res) => {
  const request = await MatchRequest.findById(req.params.id);
  if (!request || String(request.fromUser) !== String(req.user._id)) {
    return res.status(404).json({ message: 'Request not found' });
  }
  request.status = 'cancelled';
  await request.save();
  const io = req.app.get('io');
  io.to(`user:${request.toUser}`).emit('partner:invite-cancelled', { requestId: request._id });
  res.json({ message: 'Cancelled' });
});

// ── ADMIN OVERSIGHT ──
// See recent requests + active sessions (monitoring only, no approval needed)
router.get('/admin/activity', protect, isAdmin, async (req, res) => {
  const requests = await MatchRequest.find()
    .populate('fromUser', 'username email')
    .populate('toUser', 'username email')
    .sort({ createdAt: -1 })
    .limit(50);
  const activeSessions = await PeerSession.find({ status: 'active' })
    .populate('participants', 'username email');
  res.json({ requests, activeSessions });
});

// Block/unblock a user from using partner matching
router.post('/admin/toggle-block/:userId', protect, isAdmin, async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.canMatch = !user.canMatch;
  await user.save();
  res.json({ userId: user._id, canMatch: user.canMatch });
});

module.exports = router;