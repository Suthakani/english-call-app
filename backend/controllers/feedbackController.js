const Feedback = require("../models/Feedback");

const createFeedback = async (req, res) => {
  try {
    const { rating, message, name } = req.body;
    const r = Number(rating);
    if (!r || r < 1 || r > 5) {
      return res.status(400).json({ message: "Please give a rating between 1 and 5" });
    }

    await Feedback.create({
      rating: r,
      message: message || "",
      name: name || "Anonymous",
    });

    res.status(201).json({ message: "Feedback saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not save feedback", error: error.message });
  }
};

const getFeedback = async (req, res) => {
  try {
    const [stats] = await Feedback.aggregate([
      { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    // Only entries with a comment show up as review cards, newest first
    const reviews = await Feedback.find({ message: { $ne: "" } })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("name rating message createdAt");

    res.json({
      reviews,
      average: stats ? Number(stats.average.toFixed(1)) : 0,
      count: stats ? stats.count : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load feedback", error: error.message });
  }
};

module.exports = { createFeedback, getFeedback };