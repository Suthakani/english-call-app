// backend/scripts/testGrantMastery.js
//
// TEST-ONLY: directly grants category mastery to a user so you can check
// the MasteryReward page + profile display without grinding 100 real
// levels. Safe to run multiple times — won't duplicate the entry.
//
// Usage (from the backend folder):
//   node scripts/testGrantMastery.js <username> <category>
//
// Example:
//   node scripts/testGrantMastery.js krishna grammar
//
// Valid categories: grammar, vocabulary, listening, pronunciation,
// dailyPractice, speaking

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const [, , username, category] = process.argv;

if (!username || !category) {
  console.log("Usage: node scripts/testGrantMastery.js <username> <category>");
  console.log("Example: node scripts/testGrantMastery.js krishna grammar");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const user = await User.findOne({ username });
  if (!user) {
    console.log(`❌ No user found with username "${username}"`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.masteredCategories = user.masteredCategories || [];
  if (user.masteredCategories.includes(category)) {
    console.log(`ℹ️  ${username} already has mastery for "${category}" — nothing to do.`);
  } else {
    user.masteredCategories.push(category);
    await user.save();
    console.log(`✅ Granted "${category}" mastery to ${username}`);
  }

  console.log("Current masteredCategories:", user.masteredCategories);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});