const VocabWord = require("../models/VocabWord");

// @route GET /api/user/vocabulary
const getVocabulary = async (req, res) => {
  try {
    const words = await VocabWord.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(words.map(w => ({
      id: w._id,
      word: w.word,
      meaning: w.meaning,
      example: w.example,
      status: w.status,
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not load vocabulary", error: error.message });
  }
};

// @route POST /api/user/vocabulary   body: { word, meaning, example }
// Called from the homepage's "Word of the Day" widget's Save button.
const addWord = async (req, res) => {
  try {
    const { word, meaning, example } = req.body;
    if (!word || !meaning) {
      return res.status(400).json({ message: "word and meaning are required" });
    }
    const saved = await VocabWord.findOneAndUpdate(
      { user: req.user._id, word: word.trim() },
      { user: req.user._id, word: word.trim(), meaning, example: example || "" },
      { upsert: true, new: true, setDefaultsOnInsert: true, collation: { locale: "en", strength: 2 } }
    );
    res.status(201).json({ id: saved._id, word: saved.word, meaning: saved.meaning, example: saved.example, status: saved.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not save word", error: error.message });
  }
};

// @route PUT /api/user/vocabulary/:id   body: { status: 'learning' | 'known' }
const updateWordStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["learning", "known"].includes(status)) {
      return res.status(400).json({ message: "status must be 'learning' or 'known'" });
    }
    const word = await VocabWord.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true }
    );
    if (!word) return res.status(404).json({ message: "Word not found" });
    res.json({ id: word._id, status: word.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not update word", error: error.message });
  }
};

module.exports = { getVocabulary, addWord, updateWordStatus };