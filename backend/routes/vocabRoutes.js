const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getVocabulary, addWord, updateWordStatus } = require("../controllers/vocabController");

router.get("/", protect, getVocabulary);
router.post("/", protect, addWord);
router.put("/:id", protect, updateWordStatus);

module.exports = router;

// Mount in server.js:
//   const vocabRoutes = require("./routes/vocabRoutes");
//   app.use("/api/user/vocabulary", vocabRoutes);