// backend/scripts/testForceEvent.js
//
// TEST-ONLY: manipulates the current week's Event so you can test the
// live-challenge flow and the top-10 certificate award without waiting
// for real calendar time to pass.
//
// Usage (from the backend folder):
//   node scripts/testForceEvent.js live      -> makes THIS week's event live right now
//   node scripts/testForceEvent.js close     -> closes THIS week's event immediately
//                                                (triggers winner finalization + certs
//                                                 the next time anyone hits /api/event/past
//                                                 or /api/tournament/... — or call
//                                                 finalizeEventIfNeeded directly below)

require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("../models/Event");
const EventSubmission = require("../models/EventSubmission");
const User = require("../models/User");
const { getPeriodKey } = require("../utils/tournamentUtils");

const [, , action] = process.argv;

if (!["live", "close"].includes(action)) {
  console.log("Usage: node scripts/testForceEvent.js <live|close>");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const periodKey = getPeriodKey("weekly", new Date());
  let event = await Event.findOne({ periodKey });

  if (!event) {
    console.log(`No event found for ${periodKey} yet — hit GET /api/event/current once first, then re-run this script.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const now = new Date();

  if (action === "live") {
    event.startsAt = new Date(now.getTime() - 60 * 1000); // started 1 min ago
    event.endsAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // ends in 48h
    event.status = "live";
    await event.save();
    console.log(`✅ Event ${periodKey} is now LIVE. Go take the challenge at /event-challenge`);
  }

  if (action === "close") {
    event.endsAt = new Date(now.getTime() - 60 * 1000); // ended 1 min ago
    event.status = "closed";
    await event.save();
    console.log(`✅ Event ${periodKey} is now CLOSED.`);

    const submissionCount = await EventSubmission.countDocuments({ periodKey });
    console.log(`   ${submissionCount} submission(s) recorded for this event.`);
    if (submissionCount === 0) {
      console.log("   ⚠️  No submissions yet — take the challenge first (while it was live) to have something to rank.");
    } else {
      console.log("   Now call GET /api/event/past (or visit the Tournament/relevant page) to trigger finalization + certificate awards.");
    }
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});