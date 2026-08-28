const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getQuestions, submitTest, setCategories } = require("../controllers/testController");

router.get("/questions", protect, getQuestions);
router.post("/submit", protect, submitTest);
router.post("/set-categories", protect, setCategories);

module.exports = router;
