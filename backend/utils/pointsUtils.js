const User = require("../models/User");
const { getCycleIndex } = require("./cycleUtils");

// For findByIdAndUpdate style updates (no user doc loaded)
const addPoints = (userId, amount) =>
  User.findByIdAndUpdate(userId, {
    $inc: { points: amount, [`cyclePoints.${getCycleIndex()}`]: amount },
  });

// For places where the user document is already loaded and saved later
const addPointsToDoc = (user, amount) => {
  const key = String(getCycleIndex());
  user.points = (user.points || 0) + amount;
  user.cyclePoints = user.cyclePoints || {};
  user.cyclePoints[key] = (user.cyclePoints[key] || 0) + amount;
  user.markModified("cyclePoints"); // Mixed type, so Mongoose needs this
};

module.exports = { addPoints, addPointsToDoc };