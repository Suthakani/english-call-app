const express = require("express");
const router = express.Router();
const { getQuiz, checkQuizAnswer, completeLevel, getCertificate, verifyCertificate } = require("../controllers/quizController");
const { protect } = require("../middleware/authMiddleware");

// ── IMPORTANT: route order matters in Express ──
// More specific routes MUST come before the generic "/:category/:level"
// catch-all below. Otherwise a request like GET /certificate/listening
// matches "/:category/:level" first (category="certificate",
// level="listening") and silently calls getQuiz instead of
// getCertificate — which is exactly the bug that was happening here.
router.post("/check", protect, checkQuizAnswer);
router.get("/certificate/:category", protect, getCertificate);

// PUBLIC — no `protect` middleware. Anyone scanning a certificate's QR
// code hits this without being logged in, so it must stay open.
router.get("/verify/:certId", verifyCertificate);

router.post("/:category/complete-level", protect, completeLevel);

// Generic catch-all — must be LAST.
router.get("/:category/:level", protect, getQuiz);

module.exports = router;