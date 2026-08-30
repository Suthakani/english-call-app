const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getLeaderboard, checkWinnerPopup, markWinnerPopupSeen, getWinnersList } = require("../controllers/leaderboardController");

router.get("/", protect, getLeaderboard);
router.get("/winner-popup", protect, checkWinnerPopup);
router.post("/winner-popup/seen", protect, markWinnerPopupSeen);
router.get("/winners", protect, getWinnersList);

module.exports = router;