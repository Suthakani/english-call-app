// One-off script to manually award a certificate for testing.
// Usage:  node scripts/addTestCertificate.js <username> <category>
// Example: node scripts/addTestCertificate.js krishna listening
//
// Place this file at backend/scripts/addTestCertificate.js
// (create the "scripts" folder if it doesn't exist yet).

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

// Same formula as backend/controllers/quizController.js buildCertId —
// kept in sync manually here since this is a one-off dev script.
const buildCertId = (category, issuedAt, userId) => {
  const cat3 = (category || "GEN").slice(0, 3).toUpperCase();
  const year = new Date(issuedAt).getFullYear();
  const last4 = String(userId || "0000").slice(-4).padStart(4, "0");
  return `SK-${cat3}-${year}-${last4}`;
};

async function main() {
  const [, , username, category] = process.argv;

  if (!username || !category) {
    console.error("Usage: node scripts/addTestCertificate.js <username> <category>");
    console.error("Example: node scripts/addTestCertificate.js krishna listening");
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DB_URI;
  if (!mongoUri) {
    console.error("Could not find a Mongo connection string in your .env file.");
    console.error("Expected one of: MONGO_URI, MONGODB_URI, or DB_URI.");
    console.error("Open your .env and tell me the exact variable name if it's different.");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const user = await User.findOne({ username });
  if (!user) {
    console.error(`No user found with username "${username}"`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const alreadyHas = (user.certificates || []).some((c) => c.category === category);
  if (alreadyHas) {
    console.log(`${username} already has a certificate for "${category}" — nothing to do.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const issuedAt = new Date();
  const certId = buildCertId(category, issuedAt, user._id);

  user.certificates = user.certificates || [];
  user.certificates.push({ category, issuedAt, certId });

  // Also unlock level 100 for that category so the certificate page's
  // "for successfully completing all 100 levels" claim stays accurate.
  user.quizLevels = user.quizLevels || {};
  user.quizLevels[category] = 100;

  await user.save();

  console.log(`✅ Certificate added for "${username}" — category: ${category}`);
  console.log(`   certId: ${certId}`);
  console.log(`   Visit: http://localhost:5173/certificate/${category}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});