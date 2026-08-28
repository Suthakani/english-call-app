const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getSessions, saveSession } = require("../controllers/sessionController");

router.get("/", protect, getSessions);
router.post("/", protect, saveSession);

module.exports = router;

// Mount in server.js — note this hangs off /api/conversation, alongside
// your existing /transcribe and /turn routes for that same prefix:
//   const sessionRoutes = require("./routes/sessionRoutes");
//   app.use("/api/conversation/sessions", sessionRoutes);