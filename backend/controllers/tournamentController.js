const User = require("../models/User");
const TournamentWinner = require("../models/TournamentWinner");
const HallOfFame = require("../models/HallOfFame");
const { getPeriodKey, getPeriodBounds, getPreviousPeriodKey } = require("../utils/tournamentUtils");
const { sendTournamentWinEmail } = require("../utils/sendEmail"); // ← ADD THIS
const TOP_N = 10;

// Builds a certificate ID for a tournament placement.
// e.g. TRN-WEEKLY-2026-W37-R01-6518
const buildTournamentCertId = (periodType, periodKey, rank, userId) => {
  const last4 = String(userId || "0000").slice(-4).toUpperCase();
  return `TRN-${periodType.toUpperCase()}-${periodKey}-R${String(rank).padStart(2, "0")}-${last4}`;
};

const buildHallOfFameCertId = (year, userId) => {
  const last4 = String(userId || "0000").slice(-4).toUpperCase();
  return `HOF-${year}-${last4}`;
};

// Finalizes the most recently completed period for a given type, if it
// hasn't been finalized yet. Lazy/on-demand — called whenever anyone
// requests tournament data, so no cron job is needed.
const finalizeIfNeeded = async (periodType) => {
  const periodKey = getPreviousPeriodKey(periodType);
  const existing = await TournamentWinner.findOne({ periodType, periodKey });
  if (existing) return existing;

  const { start, end } = getPeriodBounds(periodType, periodKey);

  const topUsers = await User.find({ isVerified: true })
    .sort({ points: -1, streakDays: -1 })
    .limit(TOP_N)
    .select("username avatarUrl points")
    .lean();

  if (topUsers.length === 0) return null; // nobody to award — skip, no record created

  const winners = topUsers.map((u, i) => {
    const rank = i + 1;
    return {
      rank,
      user: u._id,
      username: u.username,
      avatarUrl: u.avatarUrl,
      points: u.points || 0,
      certId: buildTournamentCertId(periodType, periodKey, rank, u._id),
    };
  });

  const record = await TournamentWinner.create({
    periodType,
    periodKey,
    periodStart: start,
    periodEnd: end,
    winners,
  });

  // Push a certificate onto each winner's User document.
  await Promise.all(
    winners.map((w) =>
      User.findByIdAndUpdate(w.user, {
        $push: {
          certificates: {
            type: "tournament",
            periodType,
            periodKey,
            rank: w.rank,
            certId: w.certId,
            issuedAt: new Date(),
          },
        },
      })
    )
  );
  // ── NEW: email each winner ──
  await Promise.all(
    winners.map(async (w) => {
      try {
        const winnerUser = await User.findById(w.user).select("email");
        if (winnerUser?.email) {
          await sendTournamentWinEmail(winnerUser.email, w.username, w.rank, periodType, w.points);
        }
      } catch (e) {
        console.error(`Failed to email tournament winner ${w.username}:`, e.message);
      }
    })
  );
  // Yearly tournaments additionally crown a permanent Hall of Fame entry
  // for the #1 finisher.
  if (periodType === "yearly") {
    const champion = winners[0];
    const year = parseInt(periodKey, 10);
    const alreadyExists = await HallOfFame.findOne({ year });
    if (!alreadyExists) {
      const certId = buildHallOfFameCertId(year, champion.user);
      await HallOfFame.create({
        year,
        user: champion.user,
        username: champion.username,
        avatarUrl: champion.avatarUrl,
        points: champion.points,
        certId,
      });
      await User.findByIdAndUpdate(champion.user, {
        $push: {
          certificates: {
            type: "hall-of-fame",
            periodKey: String(year),
            rank: 1,
            certId,
            issuedAt: new Date(),
          },
        },
      });
    }
  }

  return record;
};

// @route GET /api/tournament/:periodType/winners
// Returns the most recent finalized periods (finalizing the latest one
// first if it's overdue), most recent first.
const getTournamentWinners = async (req, res) => {
  try {
    const { periodType } = req.params;
    if (!["weekly", "monthly", "yearly"].includes(periodType)) {
      return res.status(400).json({ message: "Invalid period type" });
    }

    await finalizeIfNeeded(periodType);

    const records = await TournamentWinner.find({ periodType })
      .sort({ periodKey: -1 })
      .limit(24)
      .lean();

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load tournament winners", error: error.message });
  }
};

// @route GET /api/tournament/hall-of-fame
// PUBLIC-ish (still requires login like the rest of the app, but not
// admin-only) — returns the full all-time Hall of Fame list.
const getHallOfFame = async (req, res) => {
  try {
    await finalizeIfNeeded("yearly");

    const entries = await HallOfFame.find().sort({ year: -1 }).lean();
    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load Hall of Fame", error: error.message });
  }
};

module.exports = { getTournamentWinners, getHallOfFame };