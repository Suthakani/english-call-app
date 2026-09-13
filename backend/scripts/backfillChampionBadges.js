// backend/scripts/backfillChampionBadges.js
//
// One-time migration: for every past CycleWinner record, make sure the
// winning user has a matching entry in championBadges + certificates.
// Safe to run multiple times — skips users who already have the badge
// for a given cycleIndex, so it won't create duplicates.
//
// Run from the backend folder:
//   node scripts/backfillChampionBadges.js

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const CycleWinner = require("../models/CycleWinner");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const winners = await CycleWinner.find().lean();
  console.log(`Found ${winners.length} past cycle winner record(s)`);

  let updated = 0;
  let skipped = 0;

  for (const record of winners) {
    const user = await User.findById(record.user);
    if (!user) {
      console.log(`  ⚠️  Skipping cycle ${record.cycleIndex} — user not found`);
      skipped++;
      continue;
    }

    const alreadyHasBadge = (user.championBadges || []).some(
      (b) => b.cycleIndex === record.cycleIndex
    );

    if (alreadyHasBadge) {
      skipped++;
      continue;
    }

    const certId = `CHAMP-${record.cycleIndex}-${user._id.toString().slice(-6).toUpperCase()}`;

    await User.findByIdAndUpdate(user._id, {
      $push: {
        championBadges: {
          cycleIndex: record.cycleIndex,
          cycleStart: record.cycleStart,
          cycleEnd: record.cycleEnd,
          points: record.points,
        },
        certificates: {
          type: "champion",
          cycleIndex: record.cycleIndex,
          certId,
        },
      },
    });

    console.log(`  ✅ Backfilled cycle ${record.cycleIndex} for ${user.username}`);
    updated++;
  }

  console.log(`\nDone. Updated: ${updated}, Skipped (already had it / missing user): ${skipped}`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});