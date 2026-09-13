const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getUpcomingEvent,
  getCurrentEvent,
  checkEventPopup,
  markEventPopupSeen,
  getChallenge,
  submitChallenge,
  getPastEvents,
} = require("../controllers/eventController");

router.get("/upcoming", protect, getUpcomingEvent);
router.get("/current", protect, getCurrentEvent);
router.get("/popup-check", protect, checkEventPopup);
router.post("/popup-seen", protect, markEventPopupSeen);
router.get("/challenge", protect, getChallenge);
router.post("/submit", protect, submitChallenge);
router.get("/past", protect, getPastEvents);

module.exports = router;