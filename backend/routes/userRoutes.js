const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  getProgress,
  changePassword,
  pingActivity,      // <-- was missing
  deleteAccount,
  exportUserData,
} = require("../controllers/userController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);
router.get("/progress", protect, getProgress);
router.post("/activity/ping", protect, pingActivity);   // <-- was missing
router.put("/change-password", protect, changePassword);
router.delete("/account", protect, deleteAccount);
router.get("/export", protect, exportUserData);

module.exports = router;