const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Anonymous", trim: true, maxlength: 40 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, default: "", trim: true, maxlength: 400 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);