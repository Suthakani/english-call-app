const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { updateWeeklyGoal } = require("../controllers/weeklyGoalController");

router.put("/", protect, updateWeeklyGoal);

module.exports = router;

// Mount in server.js:
//   const weeklyGoalRoutes = require("./routes/weeklyGoalRoutes");
//   app.use("/api/user/weekly-goal", weeklyGoalRoutes);