const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getActivity } = require("../controllers/activityController");
const { pingActivity } = require("../controllers/userController");

router.get("/", protect, getActivity);
router.post("/ping", protect, pingActivity);

module.exports = router;