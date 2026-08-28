// One-time password reset script.
// Usage: node resetPassword.js
// Run this from your backend folder (same place you run `npm start`).
// It connects using the same MONGO_URI your app already uses, finds the
// account by email, and sets a new password (which gets hashed
// automatically by the User model's pre-save hook).
//
// Delete this file after you're done using it.

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const EMAIL_TO_RESET = "suthakani140@gmail.com";
const NEW_PASSWORD = "test1234"; // change this to whatever you want, min 6 chars

(async () => {
  try {
    // NOTE: if your db.js uses a different env var name (e.g. MONGODB_URI
    // instead of MONGO_URI), change the line below to match.
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const user = await User.findOne({ email: EMAIL_TO_RESET.toLowerCase().trim() });
    if (!user) {
      console.log("No user found with that email.");
      process.exit(1);
    }

    console.log("Found user:", user.username, user.email, "isVerified:", user.isVerified);

    user.password = NEW_PASSWORD; // pre-save hook will hash this automatically
    await user.save();

    console.log(`Password reset! You can now log in with:\n  email: ${user.email}\n  password: ${NEW_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();