const User = require("../models/User");

// @route PUT /api/user/weekly-goal   body: { target: 1-7 }
const updateWeeklyGoal = async (req, res) => {
  try {
    const target = Number(req.body.target);
    if (!Number.isInteger(target) || target < 1 || target > 7) {
      return res.status(400).json({ message: "target must be an integer from 1 to 7" });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { weeklyGoalTarget: target },
      { new: true }
    ).select("weeklyGoalTarget");
    res.json({ target: user.weeklyGoalTarget });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update weekly goal", error: error.message });
  }
};

module.exports = { updateWeeklyGoal };