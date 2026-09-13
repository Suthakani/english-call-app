require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");
const { initSocket } = require("./socketServer");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const userRoutes = require("./routes/userRoutes");
const quizRoutes = require("./routes/quizRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

const activityRoutes = require("./routes/activityRoutes");
const vocabRoutes = require("./routes/vocabRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const weeklyGoalRoutes = require("./routes/weeklyGoalRoutes");

// NEW — peer practice matching (direct invite + admin oversight)
const matchRoutes = require("./routes/matchRoutes");

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "SpeakUp API running" }));

app.use("/api/auth", authRoutes);
app.use('/api/challenge', require('./routes/challenge'));
app.use("/api/test", testRoutes);

app.use("/api/user/activity", activityRoutes);
app.use("/api/user/vocabulary", vocabRoutes);
app.use("/api/user/weekly-goal", weeklyGoalRoutes);
app.use("/api/conversation/sessions", sessionRoutes);

// NEW — must come before /api/user below for the same catch-all reason
// as the other feature routes
app.use("/api/match", matchRoutes);

app.use("/api/conversation", conversationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/qna", require("./routes/qnaRoutes"));
app.get("/api/announcement", async (req, res) => {
  try {
    const SiteSettings = require("./models/SiteSettings");
    const settings = await SiteSettings.findOne({ key: "site-settings" });
    res.json({
      message: settings?.announcementMessage || "",
      active: settings?.announcementActive || false,
    });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
});
app.use('/audio', express.static('public/audio'));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

// ── http server + Socket.io — must come AFTER app is fully set up ──
const server = http.createServer(app);
const io = initSocket(server);
app.set("io", io); // routes access this via req.app.get('io')

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));