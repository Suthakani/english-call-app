const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getQuestions, askQuestion, replyToQuestion } = require("../controllers/qnaController");

const router = express.Router();

router.get("/:pageSlug", getQuestions);
router.post("/:pageSlug", protect, askQuestion);
router.post("/:pageSlug/:questionId/reply", protect, replyToQuestion);

module.exports = router;