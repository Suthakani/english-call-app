const fetch = require("node-fetch");
const FormData = require("form-data");
const categories = require("../data/categories");
const User = require("../models/User");

// Phrases Whisper hallucinates on silent/noisy/short audio —
// treat these as "nothing was said" instead of a real transcription.
const HALLUCINATION_PHRASES = new Set([
  "thank you.",
  "thank you",
  "thanks for watching.",
  "thanks for watching",
  "please subscribe.",
  "please subscribe",
  "you",
  "bye.",
  "bye",
]);

// Transcribes recorded audio using Groq's free Whisper API
const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No audio file received" });

    const form = new FormData();
    form.append("file", req.file.buffer, { filename: "recording.webm", contentType: req.file.mimetype });
    form.append("model", "whisper-large-v3-turbo");

    // Language-ஐ English என்று கட்டாயப்படுத்துகிறோம் (Whisper குழப்பம் தவிர்க்க)
    form.append("language", "en");

    // Deterministic decoding — reduces the model "inventing" text on short
    // or silence-padded clips (temperature 0 = no random sampling).
    form.append("temperature", "0");

    // verbose_json gives us per-segment confidence (no_speech_prob,
    // avg_logprob) so we can detect and drop hallucinated segments —
    // regular json/text just gives the raw (possibly hallucinated) text
    // with no way to tell it apart from a real transcription.
    form.append("response_format", "verbose_json");

    // NOTE: intentionally NOT sending a "prompt" field.
    // Whisper can latch onto prompt text and echo it back verbatim on
    // short/quiet/unclear audio instead of actually transcribing — that's
    // exactly what was happening ("The user is speaking English." coming
    // back as the "transcription" no matter what was said).

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        ...form.getHeaders(),
      },
      body: form,
    });
    const data = await response.json();

    console.log("========== TRANSCRIBE ==========");
    console.log("File size:", req.file.size);
    console.log("Mime type:", req.file.mimetype);
    console.log("Groq Response:", JSON.stringify(data, null, 2));
    console.log("================================");

    if (data.text === undefined) throw new Error(JSON.stringify(data));

    // ── Confidence-based hallucination filter ──
    const NO_SPEECH_PROB_THRESHOLD = 0.5;
    const AVG_LOGPROB_THRESHOLD = -1.0;

    let finalText = data.text || "";

    if (Array.isArray(data.segments) && data.segments.length > 0) {
      const confidentSegments = data.segments.filter(
        (seg) =>
          (seg.no_speech_prob ?? 0) < NO_SPEECH_PROB_THRESHOLD &&
          (seg.avg_logprob ?? 0) > AVG_LOGPROB_THRESHOLD
      );

      console.log(
        "Segments:",
        data.segments.map((s) => ({
          text: s.text,
          no_speech_prob: s.no_speech_prob,
          avg_logprob: s.avg_logprob,
        }))
      );

      finalText = confidentSegments.map((s) => s.text).join(" ").trim();
    }

    const lowerText = finalText.trim().toLowerCase();
    if (!finalText.trim() || HALLUCINATION_PHRASES.has(lowerText)) {
      console.log("⚠️ Whisper Hallucination detected / low confidence! Ignoring and returning empty text.");
      return res.json({ text: "" });
    }

    res.json({ text: finalText.trim() });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Transcription failed. Check GROQ_API_KEY.", error: error.message });
  }
};

// Three FREE provider options...
const callAI = async (systemPrompt, userMessage, nativeLanguage = "the user's native language") => {
  if (process.env.AI_PROVIDER === "groq") {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              systemPrompt +
              `\nAlways respond ONLY with valid JSON, no markdown, in this exact shape: {"hasError": boolean, "correction": "corrected sentence or empty string", "explanation": "very short explanation naturally mixing simple English with ${nativeLanguage} (the way people commonly code-switch when speaking casually), if error, else empty", "reply": "your natural conversational reply continuing the roleplay"}`,
          },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });
    const data = await response.json();
    if (!data.choices) throw new Error(JSON.stringify(data));
    return JSON.parse(data.choices[0].message.content);
  }

  if (process.env.AI_PROVIDER === "ollama") {
    const response = await fetch(process.env.OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1",
        prompt: `${systemPrompt}\n\nUser said: "${userMessage}"\n\nRespond as JSON only, no markdown, in this exact shape:\n{"hasError": boolean, "correction": "corrected sentence or empty string", "explanation": "very short simple explanation in Tamil-English (Tanglish) if error, else empty", "reply": "your natural conversational reply continuing the roleplay"}`,
        stream: false,
      }),
    });
    const data = await response.json();
    const cleaned = data.response.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  }

  // Fallback: Hugging Face Inference API (free tier, rate-limited)
  const response = await fetch(
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `${systemPrompt}\nUser said: "${userMessage}"\nRespond ONLY as JSON: {"hasError":bool,"correction":"","explanation":"","reply":""}`,
      }),
    }
  );
  const data = await response.json();
  const text = Array.isArray(data) ? data[0].generated_text : data.generated_text;
  const jsonStart = text.indexOf("{");
  return JSON.parse(text.slice(jsonStart));
};

// Increments this user's turn count for the given category — creates a
// fresh entry the first time they practice that category. Fire-and-forget
// from conversationTurn (doesn't block the AI response going back to the
// user), but errors are still logged if the DB write fails.
const trackCategoryProgress = async (userId, categoryKey) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const entry = user.categoryProgress.find((c) => c.category === categoryKey);
    if (entry) {
      entry.turnsCompleted += 1;
      entry.lastPracticed = new Date();
    } else {
      user.categoryProgress.push({ category: categoryKey, turnsCompleted: 1, lastPracticed: new Date() });
    }
    user.totalSessions += 1;
    user.points = (user.points || 0) + 10;   // NEW — +10 points per conversation turn
    await user.save();
  } catch (err) {
    console.error("Failed to track category progress:", err);
  }
};

// @route POST /api/conversation/turn
const conversationTurn = async (req, res) => {
  try {
    const { category, level, userText, history = [] } = req.body;
    const categoryKey = categories[category] ? category : "daily";
    const cat = categories[categoryKey];

    const levelInstruction = {
      basic: "The user is a BASIC level learner. Use very simple words, short sentences, and be extra encouraging.",
      intermediate: "The user is an INTERMEDIATE learner. Use natural everyday vocabulary and moderately complex sentences.",
      advanced: "The user is an ADVANCED learner. Use natural, fast-paced, idiomatic native-level English, minimal hand-holding.",
    }[level] || "Use simple, clear English.";

    const historyContext = history
      .slice(-6)
      .map((h) => `${h.role}: ${h.text}`)
      .join("\n");

    // ── Special control messages from the frontend (TextPractice.jsx) ──
    // __START__  -> ask the very first practice question, don't correct anything
    // __HINT__   -> give a hint for the current/last question, don't correct anything
    let systemPrompt;
    let effectiveUserText = userText;
    const isControlMessage = userText === "__START__" || userText === "__HINT__";

    if (userText === "__START__") {
      systemPrompt =
        `${cat.basePrompt}\n${levelInstruction}\n` +
        `This is the very start of a practice session. Ask the user ONE clear practice question ` +
        `or prompt to begin (do not greet at length, just ask the first question naturally). ` +
        `Do not correct anything — set hasError to false and correction/explanation to empty strings.`;
      effectiveUserText = "Start the practice session.";
    } else if (userText === "__HINT__") {
      systemPrompt =
        `${cat.basePrompt}\n${levelInstruction}\n` +
        `The user is stuck and asked for a hint on the CURRENT question (the last question you asked in the ` +
        `conversation so far). Give a short, helpful hint that guides them toward the answer WITHOUT giving the ` +
        `full answer away. Do not ask a new question. Do not correct anything — set hasError to false and ` +
        `correction/explanation to empty strings. Put the hint text in "reply".`;
      effectiveUserText = "Give me a hint for the current question.";
    } else {
      systemPrompt = `${cat.basePrompt}\n${levelInstruction}\nAlways first silently check the user's sentence for grammar/vocabulary mistakes.`;
    }

    const aiResult = await callAI(
      `${systemPrompt}\n\nConversation so far:\n${historyContext}`,
      effectiveUserText,
      req.user.nativeLanguage || "the user's native language"
    );

    // Don't count __START__/__HINT__ control turns toward progress tracking.
    if (!isControlMessage) {
      trackCategoryProgress(req.user._id, categoryKey);
    }

    res.json({
      hasError: aiResult.hasError,
      correction: aiResult.correction,
      explanation: aiResult.explanation,
      aiReply: aiResult.reply,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "AI service error. Is Ollama running? (ollama serve)", error: error.message });
  }
};

module.exports = { conversationTurn, transcribeAudio };