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
      user: { id: user._id, username: user.username, email: user.email, level: user.level, avatarUrl: user.avatarUrl, role: user.role, nativeLanguage: user.nativeLanguage },
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
        nativeLanguage: user.nativeLanguage,   // ADD THIS
        championBadges: user.championBadges || [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/auth/google
// Frontend already completed the Firebase popup sign-in and just hands us
// the resulting Firebase user's email/name/photo/uid. This ONLY checks
// whether an account already exists for this email:
//   - If yes: log them in immediately, same as normal login.
//   - If no: do NOT create an account here. Hand back the Google profile
//     info so the frontend can send the user to the real /register page,
//     where they choose their own native language (never defaulted) and
//     confirm/edit their username instead of an account being silently
//     created with guessed values.
const googleLogin = async (req, res) => {
  try {
    const { email, username, photoUrl, uid } = req.body;
    if (!email || !uid) {
      return res.status(400).json({ message: "Missing Google account info" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        newUser: true,
        email: normalizedEmail,
        username: username || "",
        photoUrl: photoUrl || "",
        uid,
      });
    }

       res.json({
      newUser: false,
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        preferredCategories: user.preferredCategories,
        avatarUrl: user.avatarUrl,
        role: user.role,
        nativeLanguage: user.nativeLanguage,   // ADD THIS
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/auth/google-register
// Called from the register page after a first-time Google sign-in, once
// the user has picked their own native language (never defaulted) and
// confirmed/edited their username. This is where the account actually
// gets created. Public route — the account doesn't exist yet, so there's
// no JWT to protect this with.
const googleRegister = async (req, res) => {
  try {
    const { email, username, photoUrl, uid, nativeLanguage, gender } = req.body;
    if (!email || !uid) {
      return res.status(400).json({ message: "Missing Google account info" });
    }
    if (!nativeLanguage) {
      return res.status(400).json({ message: "Please select your native language" });
    }
    if (!username || !username.trim()) {
      return res.status(400).json({ message: "Please enter a username" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists — please log in instead" });
    }

    const randomPassword = crypto.randomBytes(32).toString("hex");
    let baseUsername = username.replace(/[^a-zA-Z0-9]/g, "");
    if (!baseUsername) baseUsername = "user";
    let finalUsername = baseUsername;
    let attempt = 0;
    while (await User.findOne({ username: finalUsername })) {
      attempt++;
      finalUsername = `${baseUsername}${Math.random().toString(36).slice(2, 6)}`;
      if (attempt > 5) break;
    }

        const user = await User.create({
      username: finalUsername,
      email: normalizedEmail,
      password: randomPassword,
      isVerified: true,
      avatarUrl: photoUrl || "",
      authProvider: "google",
      nativeLanguage,
      gender,
    });

        res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        preferredCategories: user.preferredCategories,
        avatarUrl: user.avatarUrl,
        role: user.role,
        nativeLanguage: user.nativeLanguage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, verifyOTP, resendOTP, loginUser, googleLogin, googleRegister };