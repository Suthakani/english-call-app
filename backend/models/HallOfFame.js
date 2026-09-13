const mongoose = require("mongoose");

const hallOfFameSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: { type: String },
    avatarUrl: { type: String },
    points: { type: Number },
    certId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HallOfFame", hallOfFameSchema);