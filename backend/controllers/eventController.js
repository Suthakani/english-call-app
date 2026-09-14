const fetch = require("node-fetch");
const Event = require("../models/Event");
const EventSubmission = require("../models/EventSubmission");
const User = require("../models/User");
const { getPeriodKey, getPeriodBounds } = require("../utils/tournamentUtils");
const { sendEventWinEmail } = require("../utils/sendEmail");   // ← ADD HERE, top
const {
  getEventQuestions,
  gradeObjectiveAnswers,
  CHALLENGE_DURATION_SECONDS,
  CHALLENGE_GRACE_SECONDS,
} = require("../utils/pickEventQuestions");

const TOP_N = 10;

// ── Scheduling ──

const getOrCreateUpcomingEvent = async () => {
  const now = new Date();
  const nextWeekDate = new Date(now);
  nextWeekDate.setUTCDate(now.getUTCDate() + 7);
  const nextPeriodKey = getPeriodKey("weekly", nextWeekDate);

  let event = await Event.findOne({ periodKey: nextPeriodKey });
  if (!event) {
    const { start } = getPeriodBounds("weekly", nextPeriodKey);
    const endsAt = new Date(start);
    endsAt.setUTCHours(endsAt.getUTCHours() + 48);
    event = await Event.create({ periodKey: nextPeriodKey, startsAt: start, endsAt, status: "upcoming" });
  }
  return event;
};

const getOrCreateCurrentEvent = async () => {
  const now = new Date();
  const currentPeriodKey = getPeriodKey("weekly", now);
  let event = await Event.findOne({ periodKey: currentPeriodKey });
  if (!event) {
    const { start } = getPeriodBounds("weekly", currentPeriodKey);
    const endsAt = new Date(start);
    endsAt.setUTCHours(endsAt.getUTCHours() + 48);
    event = await Event.create({ periodKey: currentPeriodKey, startsAt: start, endsAt, status: "upcoming" });
  }

  let status = "upcoming";
  if (now >= event.startsAt && now < event.endsAt) status = "live";
  else if (now >= event.endsAt) status = "closed";
  if (status !== event.status) {
    event.status = status;
    await event.save();
  }
  return event;
};

// @route GET /api/event/upcoming
const getUpcomingEvent = async (req, res) => {
  try {
    await getOrCreateCurrentEvent();
    const event = await getOrCreateUpcomingEvent();
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load upcoming event", error: error.message });
  }
};

// @route GET /api/event/current
// Used by the homepage banner + challenge page to know whether an event
// is currently live, and whether THIS user has already submitted.
const getCurrentEvent = async (req, res) => {
  try {
    const event = await getOrCreateCurrentEvent();
    const submission = await EventSubmission.findOne({ user: req.user._id, periodKey: event.periodKey }).lean();
    const hasSubmitted = submission?.status === "completed";
    res.json({ event, hasSubmitted, myScore: hasSubmitted ? submission.totalScore : null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load current event", error: error.message });
  }
};

// @route GET /api/event/popup-check
const checkEventPopup = async (req, res) => {
  try {
    const event = await getOrCreateUpcomingEvent();
    const user = await User.findById(req.user._id).select("lastSeenEventKey").lean();
    const alreadySeen = user?.lastSeenEventKey === event.periodKey;
    res.json({ show: !alreadySeen, event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not check event popup", error: error.message });
  }
};

// @route POST /api/event/popup-seen
const markEventPopupSeen = async (req, res) => {
  try {
    const event = await getOrCreateUpcomingEvent();
    await User.findByIdAndUpdate(req.user._id, { $set: { lastSeenEventKey: event.periodKey } });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update popup status", error: error.message });
  }
};

// ── Challenge ──

// @route GET /api/event/challenge
// Only serves questions while the event is LIVE, and only if the user
// hasn't already completed an attempt. Starts (or resumes) the overall
// timer by creating/reusing an "in_progress" submission doc.
const getChallenge = async (req, res) => {
  try {
    const event = await getOrCreateCurrentEvent();
    if (event.status !== "live") {
      return res.status(403).json({ message: "The challenge isn't live right now." });
    }

    const existing = await EventSubmission.findOne({ user: req.user._id, periodKey: event.periodKey });
    if (existing && existing.status === "completed") {
      return res.status(403).json({ message: "You've already submitted your attempt for this event." });
    }

    // Reuse the same startedAt if already in progress (don't let refreshing reset the clock).
    let attempt = existing;
    if (!attempt) {
      attempt = await EventSubmission.create({
        user: req.user._id,
        periodKey: event.periodKey,
        status: "in_progress",
        startedAt: new Date(),
      });
    }

    const { grammarVocab, listening, imageVocab, idioms, reading, writingPrompt, durationSeconds } = getEventQuestions(event.periodKey);

    res.json({
      periodKey: event.periodKey,
      eventEndsAt: event.endsAt,
      grammarVocab,
      listening,
      imageVocab,
      idioms,
      reading,
      writingPrompt,
      durationSeconds,
      startedAt: attempt.startedAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load challenge", error: error.message });
  }
};

// Lightweight AI grading for the writing task — 0-20 scale, JSON response.
// Uses the same Groq setup as conversationController; kept self-contained
// here rather than importing, since this scoring prompt/shape is specific
// to the event's rubric.
const gradeWriting = async (prompt, text) => {
  if (!text || text.trim().length < 5) {
    return { score: 0, feedback: "No answer submitted." };
  }
  if (process.env.AI_PROVIDER !== "groq") {
    // Fallback heuristic if Groq isn't configured: reward reasonable length only.
    const words = text.trim().split(/\s+/).length;
    const score = Math.max(0, Math.min(20, Math.round((words / 40) * 20)));
    return { score, feedback: "Auto-scored by length (AI grading not configured)." };
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are grading a short English writing response for a proficiency exam. " +
              "The prompt was: \"" + prompt + "\". " +
              "Score the response from 0 to 20 based on grammar accuracy, vocabulary range, and coherence/relevance to the prompt. " +
              "Respond ONLY with valid JSON: {\"score\": number (0-20), \"feedback\": \"one short sentence of feedback\"}",
          },
          { role: "user", content: text },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    const score = Math.max(0, Math.min(20, Math.round(parsed.score || 0)));
    return { score, feedback: parsed.feedback || "" };
  } catch (err) {
    console.error("Writing grading failed:", err);
    return { score: 0, feedback: "Could not grade automatically — scored as 0." };
  }
};

// @route POST /api/event/submit
// body: { answers: { [questionId]: selectedOption }, writingText }
const submitChallenge = async (req, res) => {
  try {
    const event = await getOrCreateCurrentEvent();
    if (event.status !== "live") {
      return res.status(403).json({ message: "The challenge isn't live right now." });
    }

    const attempt = await EventSubmission.findOne({ user: req.user._id, periodKey: event.periodKey });
    if (!attempt) {
      return res.status(403).json({ message: "Start the challenge before submitting." });
    }
    if (attempt.status === "completed") {
      return res.status(403).json({ message: "You've already submitted your attempt for this event." });
    }

    const elapsedSeconds = (Date.now() - new Date(attempt.startedAt).getTime()) / 1000;
    if (elapsedSeconds > CHALLENGE_DURATION_SECONDS + CHALLENGE_GRACE_SECONDS) {
      return res.status(403).json({ message: "Time's up for this attempt — the challenge window has closed." });
    }

    const { answers = {}, writingText = "" } = req.body;
    const { objectiveScore, objectiveMax } = gradeObjectiveAnswers(event.periodKey, answers);
    const { writingPrompt } = getEventQuestions(event.periodKey);
    const { score: writingScore, feedback: writingFeedback } = await gradeWriting(writingPrompt, writingText);

    const totalScore = objectiveScore + writingScore;

    attempt.status = "completed";
    attempt.objectiveScore = objectiveScore;
    attempt.objectiveMax = objectiveMax;
    attempt.writingScore = writingScore;
    attempt.totalScore = totalScore;
    attempt.writingText = writingText;
    attempt.writingFeedback = writingFeedback;
    await attempt.save();

    res.json({
      totalScore,
      objectiveScore,
      objectiveMax,
      writingScore,
      writingMax: 20,
      writingFeedback,
      maxPossible: objectiveMax + 20,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not submit challenge", error: error.message });
  }
};

// ── Winners ──

const buildEventCertId = (periodKey, rank, userId) => {
  const last4 = String(userId || "0000").slice(-4).toUpperCase();
  return `EVT-${periodKey}-R${String(rank).padStart(2, "0")}-${last4}`;
};

// Finalizes a CLOSED event's winners (top 10 by totalScore) exactly once,
// issuing certificates. Lazy — called whenever winners are requested.
const finalizeEventIfNeeded = async (periodKey) => {
  const event = await Event.findOne({ periodKey });
  if (!event) return null;

  const now = new Date();
  if (now < event.endsAt) return event; // not closed yet
  if (event.winnersFinalized) return event;

  // Only count attempts that were actually completed — an abandoned
  // in-progress record (timer ran out, user never submitted) shouldn't
  // show up in the leaderboard.
  const topSubmissions = await EventSubmission.find({ periodKey, status: "completed" })
    .sort({ totalScore: -1 })
    .limit(TOP_N)
    .populate("user", "username avatarUrl")
    .lean();

  const winners = topSubmissions
    .filter((s) => s.user)
    .map((s, i) => ({
      rank: i + 1,
      user: s.user._id,
      username: s.user.username,
      avatarUrl: s.user.avatarUrl,
      score: s.totalScore,
      certId: buildEventCertId(periodKey, i + 1, s.user._id),
    }));

  event.winners = winners;
  event.winnersFinalized = true;
  await event.save();


      
  await Promise.all(
    winners.map((w) =>
      User.findByIdAndUpdate(w.user, {
        $push: {
          certificates: {
            type: "event",
            periodKey,
            rank: w.rank,
            certId: w.certId,
            issuedAt: new Date(),
          },
        },
      })
    )
  );

  // ── NEW: email each winner ──
  await Promise.all(
    winners.map(async (w) => {
      try {
        const winnerUser = await User.findById(w.user).select("email");
        if (winnerUser?.email) {
          await sendEventWinEmail(winnerUser.email, w.username, w.rank, w.score);
        }
      } catch (e) {
        console.error(`Failed to email event winner ${w.username}:`, e.message);
      }
    })
  );

  return event;
};
 

// @route GET /api/event/past
// Recent closed events with their finalized winners.
const getPastEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "closed" }).sort({ periodKey: -1 }).limit(12);
    const finalized = await Promise.all(events.map((e) => finalizeEventIfNeeded(e.periodKey)));
    res.json(finalized.filter(Boolean));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load past events", error: error.message });
  }
};

module.exports = {
  getUpcomingEvent,
  getCurrentEvent,
  checkEventPopup,
  markEventPopupSeen,
  getChallenge,
  submitChallenge,
  getPastEvents,
};