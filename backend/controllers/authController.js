const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendVerificationEmail } = require("../utils/sendEmail");
const crypto = require("crypto");
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { username, email, password, nativeLanguage } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { username }] });
    if (existing) {
      return res.status(400).json({ message: "Username or email already in use" });
    }

    const otp = generateOTP();
    const user = await User.create({
      username,
      email: normalizedEmail,
      password,
      nativeLanguage,
      verificationOTP: otp,
      verificationOTPExpires: Date.now() + 10 * 60 * 1000, // 10 mins
    });

    await sendVerificationEmail(normalizedEmail, otp);

    res.status(201).json({
      message: "Registered! Please check your email for the OTP to verify your account.",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    if (user.verificationOTP !== otp || user.verificationOTPExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await user.save();

    res.json({
      message: "Email verified successfully!",
      token: generateToken(user._id),
      user: { id: user._id, username: user.username, email: user.email, level: user.level, avatarUrl: user.avatarUrl, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/auth/resend-otp
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    user.verificationOTP = otp;
    user.verificationOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(user.email, otp);
    res.json({ message: "OTP resent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Mongoose's schema-level `lowercase`/`trim` on the email path only
    // applies when a document is saved (e.g. during registration) — it does
    // NOT run on raw query filters like findOne({ email }). Without this,
    // logging in with any different casing than what was stored (e.g.
    // "Sakthi@gmail.com" vs the saved "sakthi@gmail.com") silently fails
    // to match and falls through to "Invalid email or password" even with
    // the correct password.
    const normalizedEmail = (email || "").toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first", userId: user._id });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        preferredCategories: user.preferredCategories,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @route POST /api/auth/google
// Frontend already completed the Firebase popup sign-in and just hands us
// the resulting Firebase user's email/name/photo/uid. We find-or-create a
// matching User document and issue our own JWT, same shape as normal
// login, so the rest of the app doesn't need to know Google was involved.
const googleLogin = async (req, res) => {
  try {
    const { email, username, photoUrl, uid } = req.body;
    if (!email || !uid) {
      return res.status(400).json({ message: "Missing Google account info" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Password is required by the schema but Google users never use it —
      // fill it with a long random value they'll never need to know.
      const randomPassword = crypto.randomBytes(32).toString("hex");
      let baseUsername = (username || normalizedEmail.split("@")[0]).replace(/[^a-zA-Z0-9]/g, "");
      if (!baseUsername) baseUsername = "user";
      let finalUsername = baseUsername;
      // usernames are unique — if taken, append a short random suffix
      let attempt = 0;
      while (await User.findOne({ username: finalUsername })) {
        attempt++;
        finalUsername = `${baseUsername}${Math.random().toString(36).slice(2, 6)}`;
        if (attempt > 5) break;
      }

      user = await User.create({
        username: finalUsername,
        email: normalizedEmail,
        password: randomPassword,
        isVerified: true, // Google already verified this email
        avatarUrl: photoUrl || "",
        authProvider: "google",
      });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        preferredCategories: user.preferredCategories,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { registerUser, verifyOTP, resendOTP, loginUser, googleLogin };