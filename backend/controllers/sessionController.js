const ConversationSession = require("../models/ConversationSession");
const User = require("../models/User");
const { addTimeSpent } = require("./activityController");
const { addPoints } = require("../utils/pointsUtils");
// @route GET /api/conversation/sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await ConversationSession.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(sessions.map(s => ({
      id: s._id,
      date: s.createdAt.toISOString().slice(0, 10),
      category: s.category,
      durationMinutes: s.durationMinutes,
      correctionsCount: s.correctionsCount,
      transcript: s.transcript,
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load call history", error: error.message });
  }
};

// @route POST /api/conversation/sessions
// body: { category, durationMinutes, correctionsCount, transcript: [{role,text}] }
// Call this from CallPractice.jsx's endCall() once the call actually ends,
// with the full accumulated `messages` state as the transcript.
const saveSession = async (req, res) => {
  try {
    const { category, durationMinutes, correctionsCount, transcript } = req.body;
    if (!category || !Array.isArray(transcript)) {
      return res.status(400).json({ message: "category and transcript are required" });
    }

    const wordsSpoken = transcript
      .filter(t => t.role === "You")
      .reduce((sum, t) => sum + (t.text || "").trim().split(/\s+/).filter(Boolean).length, 0);

    const session = await ConversationSession.create({
      user: req.user._id,
      category,
      durationMinutes: durationMinutes || 0,
      correctionsCount: correctionsCount || 0,
      wordsSpoken,
      transcript,
    });
    await addPoints(req.user._id, 500);
    // Opportunistically update personal bests — only write if this session
    // actually beats the stored record, so we never need a separate
    // recompute job.

    const user = await User.findById(req.user._id);
    if (user) {
      user.personalBests = user.personalBests || {};
      if (wordsSpoken > (user.personalBests.mostWordsInOneCall || 0)) {
        user.personalBests.mostWordsInOneCall = wordsSpoken;
      }
      if ((durationMinutes || 0) > (user.personalBests.longestCallMinutes || 0)) {
        user.personalBests.longestCallMinutes = durationMinutes || 0;
      }
      await user.save();
    }

    // NEW — log real practice time (in seconds) for today, so admin
    // analytics can show actual time spent, not just turn counts.
    await addTimeSpent(req.user._id, (durationMinutes || 0) * 60);

    res.status(201).json({ id: session._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not save call session", error: error.message });
  }
};

module.exports = { getSessions, saveSession };