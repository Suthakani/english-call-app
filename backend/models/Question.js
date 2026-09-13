const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    reply: { type: String, required: true, trim: true, maxlength: 1000 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    // NEVER set this from the request body — always derive it from
    // req.user.role on the server (see routes/qna.js). Trusting a
    // client-sent isAdmin flag would let any user fake an official answer.
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema(
  {
    // Which detail page this question belongs to, e.g. "streak", "grammar"
    pageSlug: { type: String, required: true, index: true },
    question: { type: String, required: true, trim: true, maxlength: 500 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    replies: { type: [replySchema], default: [] },
  },
  { timestamps: true }
);

questionSchema.index({ pageSlug: 1, createdAt: -1 });

module.exports = mongoose.model('Question', questionSchema);