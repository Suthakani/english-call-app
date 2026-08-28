// ── models/ContactSubmission.js ──
const mongoose = require("mongoose");

const contactSubmissionSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "resolved"], default: "new" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactSubmission", contactSubmissionSchema);


// ── models/ChallengeResult.js ──
// If you already store daily-challenge results somewhere (e.g. inside
// the User doc, or another existing collection), skip this model and
// point getChallengeStats at that collection/field instead.
//
// const mongoose = require("mongoose");
//
// const challengeResultSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     challengeSlug: String,
//     score: Number,
//     maxScore: Number,
//     badgeAwarded: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );
//
// module.exports = mongoose.model("ChallengeResult", challengeResultSchema);


// ── Wiring ContactSubmission into your public /contact route ──
// Find your existing POST /contact handler (the one homepage.jsx's
// handleContact calls) and save the submission there:
//
// const ContactSubmission = require("../models/ContactSubmission");
//
// const submitContact = async (req, res) => {
//   try {
//     const { firstName, lastName, email, subject, message } = req.body;
//     await ContactSubmission.create({ firstName, lastName, email, subject, message });
//     res.json({ ok: true });
//   } catch (error) {
//     res.status(500).json({ message: "Could not send message", error: error.message });
//   }
// };


// ── Adding authProvider to User (needed for getLoginMethodSplit) ──
// In your User schema, add:
//
//   authProvider: { type: String, enum: ["email", "google"], default: "email" }
//
// Then set it to "google" wherever your backend handles the Firebase
// Google sign-in callback (the endpoint your frontend's
// handleGoogleLogin flow talks to after signInWithPopup succeeds) —
// e.g. when creating/finding the user record for that Google account:
//
//   User.findOneAndUpdate(
//     { email: googleUser.email },
//     { $setOnInsert: { authProvider: "google", ... } },
//     { upsert: true, new: true }
//   );
//
// Existing users created via email/password already default to
// "email", so no backfill needed.