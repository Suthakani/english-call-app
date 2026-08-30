const mongoose = require("mongoose");

// A single-document collection — we always read/write the one row with
// a fixed key, rather than modeling multiple settings documents. Simpler
// than a generic key-value store for the handful of site-wide toggles
// the admin dashboard needs to control.
const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "site-settings", unique: true },
    announcementMessage: { type: String, default: "" },
    announcementActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);