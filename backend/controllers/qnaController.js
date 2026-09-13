const Question = require("../models/Question");

// GET /api/qna/:pageSlug — public, no login required to read
const getQuestions = async (req, res) => {
  try {
    const { pageSlug } = req.params;
    const questions = await Question.find({ pageSlug })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: "Could not load questions", error: error.message });
  }
};

// POST /api/qna/:pageSlug — ask a question (requires login)
const askQuestion = async (req, res) => {
  try {
    const { pageSlug } = req.params;
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question cannot be empty" });
    }
    if (question.length > 500) {
      return res.status(400).json({ message: "Question is too long" });
    }

    const newQuestion = await Question.create({
      pageSlug,
      question: question.trim(),
      userId: req.user.id,
      username: req.user.username,
    });

    res.status(201).json({ question: newQuestion });
  } catch (error) {
    res.status(500).json({ message: "Could not post question", error: error.message });
  }
};

// POST /api/qna/:pageSlug/:questionId/reply — reply to a question (requires login)
// isAdmin is ALWAYS derived from req.user.role here, never from req.body —
// otherwise any logged-in user could fake an "Official Answer".
const replyToQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({ message: "Reply cannot be empty" });
    }
    if (reply.length > 1000) {
      return res.status(400).json({ message: "Reply is too long" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.replies.push({
      reply: reply.trim(),
      userId: req.user.id,
      username: req.user.username,
      isAdmin: req.user.role === "admin",
    });
    await question.save();

    res.status(201).json({ reply: question.replies[question.replies.length - 1] });
  } catch (error) {
    res.status(500).json({ message: "Could not post reply", error: error.message });
  }
};

// GET /api/admin/qna — all questions across every pageSlug, for the admin panel
const getAllQuestionsForAdmin = async (req, res) => {
  try {
    const questions = await Question.find({})
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: "Could not load questions", error: error.message });
  }
};

module.exports = { getQuestions, askQuestion, replyToQuestion, getAllQuestionsForAdmin };