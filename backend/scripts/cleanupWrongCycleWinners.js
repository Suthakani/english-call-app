// One-time cleanup script — undoes the 24 wrongly-backfilled CycleWinner
// records (created before CYCLE_START_DATE was corrected) and reverses
// the streak-freeze rewards + wonCycles entries they triggered.
//
// Run this ONCE from the backend folder:
//   node scripts/cleanupWrongCycleWinners.js
//
// Safe to run even if there's nothing to clean up (it just does nothing).

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const CycleWinner = require('../models/CycleWinner');
const User = require('../models/User');

(async () => {
  await connectDB();

  const allWinners = await CycleWinner.find().lean();
  if (allWinners.length === 0) {
    console.log('No CycleWinner records found — nothing to clean up.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${allWinners.length} CycleWinner record(s). Reversing rewards...`);

  // Group by user so we only touch each user's document once.
  const byUser = {};
  for (const w of allWinners) {
    const uid = String(w.user);
    byUser[uid] = byUser[uid] || { cycles: [], freezes: 0 };
    byUser[uid].cycles.push(w.cycleIndex);
    byUser[uid].freezes += (w.rewards?.streakFreezes ?? 3);
  }

  for (const [userId, info] of Object.entries(byUser)) {
    const user = await User.findById(userId);
    if (!user) continue;

    const before = user.streakFreezeCount;
    user.streakFreezeCount = Math.max(0, (user.streakFreezeCount || 0) - info.freezes);
    user.wonCycles = (user.wonCycles || []).filter(c => !info.cycles.includes(c));
    if (info.cycles.includes(user.unseenWinCycle)) user.unseenWinCycle = null;
    await user.save();

    console.log(
      `User ${user.username}: streakFreezeCount ${before} -> ${user.streakFreezeCount} ` +
      `(removed ${info.freezes} from ${info.cycles.length} cycle(s)), wonCycles now [${user.wonCycles.join(', ')}]`
    );
  }

  const { deletedCount } = await CycleWinner.deleteMany({});
  console.log(`Deleted ${deletedCount} CycleWinner record(s).`);

  console.log('Cleanup complete.');
  await mongoose.disconnect();
})().catch(err => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});