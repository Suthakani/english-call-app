const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getTournamentWinners, getHallOfFame } = require("../controllers/tournamentController");

router.get("/hall-of-fame", protect, getHallOfFame);
router.get("/:periodType/winners", protect, getTournamentWinners);

module.exports = router;