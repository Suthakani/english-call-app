const express = require("express");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/authMiddleware");
const {
  getOverview,
  getCategoryPopularity,
  getAllUsers,
  getUserDetail,
  getAtRiskUsers,
  getLevelDistribution,
  getContactSubmissions,
  updateContactSubmission,
  getChallengeStats,
  getVocabStats,
  getLevelTestStats,
  getDauTrend,
  getLanguageBreakdown,
  getLoginMethodSplit,
  sendReminderToUser,
  sendReminderBulk,
  getAnnouncement,
  updateAnnouncement,
} = require("../controllers/adminController");

// ── NEW — learner Q&A from detail pages ──
const { getAllQuestionsForAdmin, replyToQuestion } = require("../controllers/qnaController");

router.get("/overview", protect, isAdmin, getOverview);
router.get("/category-popularity", protect, isAdmin, getCategoryPopularity);
router.get("/users", protect, isAdmin, getAllUsers);
router.get("/user/:id", protect, isAdmin, getUserDetail);
router.get("/at-risk", protect, isAdmin, getAtRiskUsers);
router.get("/level-distribution", protect, isAdmin, getLevelDistribution);

// ── New routes ──
router.get("/contact-submissions", protect, isAdmin, getContactSubmissions);
router.patch("/contact-submissions/:id", protect, isAdmin, updateContactSubmission);
router.get("/challenge-stats", protect, isAdmin, getChallengeStats);
router.get("/vocab-stats", protect, isAdmin, getVocabStats);
router.get("/level-test-stats", protect, isAdmin, getLevelTestStats);
router.get("/dau-trend", protect, isAdmin, getDauTrend);
router.get("/language-breakdown", protect, isAdmin, getLanguageBreakdown);
router.get("/login-method-split", protect, isAdmin, getLoginMethodSplit);

// ── Re-engagement reminders ──
router.post("/send-reminder/:userId", protect, isAdmin, sendReminderToUser);
router.post("/send-reminders-bulk", protect, isAdmin, sendReminderBulk);
router.get("/announcement", protect, isAdmin, getAnnouncement);
router.put("/announcement", protect, isAdmin, updateAnnouncement);

// ── NEW — learner Q&A ──
router.get("/qna", protect, isAdmin, getAllQuestionsForAdmin);
router.post("/qna/:questionId/reply", protect, isAdmin, replyToQuestion);

module.exports = router;