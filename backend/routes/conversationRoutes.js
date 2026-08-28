const express = require("express");
const multer = require("multer");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { conversationTurn, transcribeAudio } = require("../controllers/conversationController");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/turn", protect, conversationTurn);
router.post("/transcribe", protect, upload.single("audio"), transcribeAudio);

module.exports = router;