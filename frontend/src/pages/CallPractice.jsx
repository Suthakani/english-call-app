import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";
import { useAuth } from "../context/AuthContext.jsx";

// Categories that use the 100-level / 10-fixed-prompts-per-level system
// (same idea as TextPractice.jsx's LEVELED_CATEGORIES).
const LEVELED_CATEGORIES = ["speaking"];

// Champion's Vault — locked unless the user has won at least one
// leaderboard cycle (user.championBadges.length > 0). Kept as a frontend
// slug list purely to redirect early with a nice message; the REAL
// enforcement must also happen backend-side (see conversationController).
const VAULT_CATEGORY_SLUGS = ["vault-boardroom-showdown", "vault-ceo-interview", "vault-live-debate"];
const MASTERY_CATEGORY_REQUIREMENTS = {
  "master-grammar-workshop": "grammar",
  "master-vocabulary-arena": "vocabulary",
  "master-listening-podcast": "listening",
  "master-pronunciation-stage": "pronunciation",
  "master-daily-gauntlet": "dailyPractice",
  "master-speaking-orator": "speaking",
};
// Voice-activity-detection tuning
const SPEECH_RMS_THRESHOLD = 0.035;      // volume level counted as "you're talking"
const MIN_UNBROKEN_SPEECH_MS = 300;      // must stay above threshold this long (small dips tolerated) before we trust it
const HANGOVER_MS = 250;                 // brief quiet gaps shorter than this don't reset the streak (natural pauses between words)
const SILENCE_AFTER_SPEECH_MS = 900;     // how long you must go quiet to end your turn (shortened — less trailing silence sent to Whisper)
const INITIAL_SILENCE_TIMEOUT_MS = 6000; // give up (no API call) if you never speak
const MAX_RECORDING_MS = 20000;          // hard safety cap per turn

// Phrases Whisper hallucinates on silent/noisy/short audio —
// treat these as "nothing was said" instead of a real transcription.
const HALLUCINATION_PHRASES = new Set([
  "the user is speaking english.",
  "the user is speaking english",
  "this is a voice conversation practice.",
  "this is a voice conversation practice. the user is speaking english.",
  "thank you.",
  "thank you",
  "thanks for watching.",
  "please subscribe.",
]);

export default function CallPractice() {
  const { category } = useParams();
  const { user, profileLoaded } = useAuth();
  const navigate = useNavigate();

  const isLeveled = LEVELED_CATEGORIES.includes(category);
  const isVaultCategory = VAULT_CATEGORY_SLUGS.includes(category);
  const hasChampionAccess = (user?.championBadges?.length || 0) > 0;

  const masteryRequired = MASTERY_CATEGORY_REQUIREMENTS[category];
  const hasMasteryAccess = masteryRequired
    ? (user?.masteredCategories || []).includes(masteryRequired)
    : true;

  const [callActive, setCallActive] = useState(false);
  const [callPhase, setCallPhase] = useState("idle"); // idle | listening | thinking | speaking
  const [messages, setMessages] = useState([]);
  const [statusText, setStatusText] = useState("Tap the phone to start the call");

  // ── Leveled-practice state (mirrors TextPractice.jsx) ──
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [totalLevels, setTotalLevels] = useState(100);
  const [viewingLevel, setViewingLevel] = useState(1);
  const [levelQuestions, setLevelQuestions] = useState([]); // the 10 fixed prompts for this level
  const [loadingLevel, setLoadingLevel] = useState(isLeveled);
  const [promptIndex, setPromptIndex] = useState(0);        // which of the 10 prompts we're on
  const [levelFinished, setLevelFinished] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const certificateEarned = isLeveled && levelFinished && viewingLevel === totalLevels;

  const messagesRef = useRef([]);
  messagesRef.current = messages;

  // Refs so async callbacks (VAD loop, recorder events) always see fresh values
  const levelQuestionsRef = useRef([]);
  levelQuestionsRef.current = levelQuestions;
  const promptIndexRef = useRef(0);
  promptIndexRef.current = promptIndex;

  const callActiveRef = useRef(false);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const vadFrameRef = useRef(null);
  const hasSpokenRef = useRef(false);
  const lastSpeechTimeRef = useRef(0);
  const recordingStartRef = useRef(0);
  const voiceStreakStartRef = useRef(null);
  const lastAboveThresholdRef = useRef(null);
  const recordingStartedRef = useRef(false);
  const callStartTimeRef = useRef(null);
  const sessionSavedRef = useRef(false);
  const autoStartNextLevelRef = useRef(false);

  useEffect(() => {
    return () => cleanupCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kick the user out if they try to open a vault category without a
  // champion win. Frontend-only guard for UX — real enforcement is backend.
  useEffect(() => {
    if (!profileLoaded) return; // wait for the full profile to hydrate first
    if (isVaultCategory && !hasChampionAccess) {
      navigate("/categories");
      return;
    }
    if (masteryRequired && !hasMasteryAccess) {
      navigate("/categories");
    }
  }, [isVaultCategory, hasChampionAccess, masteryRequired, hasMasteryAccess, profileLoaded, navigate]);

  // Load this level's 10 fixed prompts whenever the category/level changes.
  useEffect(() => {
    if (!isLeveled) {
      setLoadingLevel(false);
      return;
    }
    setLoadingLevel(true);
    api
      .get(`/quiz/${category}/${viewingLevel}`)
      .then(({ data }) => {
        setLevelQuestions(data.questions || []);
        if (data.levelInfo) {
          setUnlockedLevel(data.levelInfo.unlockedLevel);
          setTotalLevels(data.levelInfo.totalLevels);
          if (viewingLevel === 1 && data.levelInfo.unlockedLevel !== 1) {
            setViewingLevel(data.levelInfo.unlockedLevel);
          }
        }
      })
      .catch((err) => console.error("Failed to load level prompts:", err))
      .finally(() => setLoadingLevel(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, viewingLevel, isLeveled]);

  // Auto-jump into the next level's call once its prompts have loaded,
  // if the user tapped "Next Level →" on the finish overlay.
  useEffect(() => {
    if (autoStartNextLevelRef.current && !loadingLevel && levelQuestions.length > 0) {
      autoStartNextLevelRef.current = false;
      startCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingLevel, levelQuestions]);

  const cleanupCall = () => {
    callActiveRef.current = false;
    cancelAnimationFrame(vadFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }
    window.speechSynthesis.cancel();
  };

  const saveSession = () => {
    if (sessionSavedRef.current) return;
    const transcript = messagesRef.current.map((m) => ({ role: m.role, text: m.text }));
    if (transcript.length === 0) return;
    sessionSavedRef.current = true;
    const durationMinutes = callStartTimeRef.current
      ? Math.max(1, Math.round((Date.now() - callStartTimeRef.current) / 60000))
      : 0;
    const correctionsCount = messagesRef.current.filter((m) => m.hasError).length;
    api
      .post("/conversation/sessions", { category, durationMinutes, correctionsCount, transcript })
      .catch((err) => console.error("Failed to save call session:", err));
  };

  // ── Call lifecycle ──
  const startCall = async () => {
    if (isLeveled && (loadingLevel || levelQuestions.length === 0)) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      callActiveRef.current = true;
      callStartTimeRef.current = Date.now();
      sessionSavedRef.current = false;
      setCallActive(true);
      setMessages([]);
      setLevelFinished(false);
      promptIndexRef.current = 0;
      setPromptIndex(0);

      if (isLeveled) {
        askCurrentPrompt();
      } else {
        startRecordingTurn();
      }
    } catch (err) {
      console.error(err);
      setStatusText("⚠️ Couldn't access the microphone. Check permission and try again.");
    }
  };

  const endCall = () => {
    saveSession();
    setCallActive(false);
    setCallPhase("idle");
    setStatusText("Call ended. Tap the phone to start again");
    cleanupCall();
  };

  // Speaks the current level's fixed prompt out loud, then starts listening
  // for the user's answer to it.
  const askCurrentPrompt = () => {
    const prompt = levelQuestionsRef.current[promptIndexRef.current];
    if (!prompt) {
      // Shouldn't happen, but don't hang the call if it does.
      startRecordingTurn();
      return;
    }
    setMessages((prev) => [...prev, { role: "AI", text: prompt.q }]);
    speak(prompt.q, () => startRecordingTurn());
  };

  // Called after the AI has spoken its reply/feedback for the current
  // prompt. Moves on to the next prompt, or wraps up the level if that
  // was the 10th one.
  const advanceLevelFlow = async () => {
    const nextIndex = promptIndexRef.current + 1;
    if (nextIndex < levelQuestionsRef.current.length) {
      promptIndexRef.current = nextIndex;
      setPromptIndex(nextIndex);
      askCurrentPrompt();
      return;
    }

    // All 10 prompts for this level are done.
    cancelAnimationFrame(vadFrameRef.current);
    setCallPhase("idle");
    setStatusText("Level complete!");
    setLevelFinished(true);
    saveSession();

    setAdvancing(true);
    try {
      const { data } = await api.post(`/quiz/${category}/complete-level`, { level: viewingLevel });
      setUnlockedLevel(data.unlockedLevel);
      setTotalLevels(data.totalLevels);
    } catch (err) {
      console.error("Failed to advance level:", err);
    } finally {
      setAdvancing(false);
    }
  };

  const goToNextLevel = () => {
    if (advancing) return;
    cleanupCall();
    setCallActive(false);
    setLevelFinished(false);
    setMessages([]);
    autoStartNextLevelRef.current = true;
    setViewingLevel((v) => Math.min(v + 1, totalLevels)); // triggers prompt reload, then auto-starts the call
  };

  const practiceLevelAgain = () => {
    if (advancing) return;
    cleanupCall();
    setCallActive(false);
    setLevelFinished(false);
    setMessages([]);
    autoStartNextLevelRef.current = true;
    // viewingLevel unchanged — the loadingLevel effect below still needs a
    // "loaded" state to trigger the auto-start effect, so nudge it directly.
    if (!loadingLevel && levelQuestions.length > 0) {
      autoStartNextLevelRef.current = false;
      startCall();
    }
  };

  // ── One turn: wait for speech → record only while you're talking (+ a
  // short trailing silence) → transcribe → send to AI → speak reply ──
  const startRecordingTurn = () => {
    if (!callActiveRef.current || !streamRef.current) return;

    chunksRef.current = [];
    hasSpokenRef.current = false;
    recordingStartedRef.current = false;
    lastSpeechTimeRef.current = Date.now();
    recordingStartRef.current = Date.now();
    voiceStreakStartRef.current = null;
    lastAboveThresholdRef.current = null;
    mediaRecorderRef.current = null;

    setCallPhase("listening");
    setStatusText("🔴 Listening... speak in English");

    watchVolume();
  };

  // Lazily starts the actual MediaRecorder the moment we detect the first
  // sign of speech. Nothing is recorded before this point, so silence while
  // you're thinking / not talking yet never gets sent to Whisper.
  const beginActualRecording = () => {
    if (recordingStartedRef.current || !streamRef.current) return;
    recordingStartedRef.current = true;

    const recorder = new MediaRecorder(streamRef.current, { mimeType: "audio/webm" });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = handleTurnRecordingStop;
    recorder.start();
    mediaRecorderRef.current = recorder;
  };

  const watchVolume = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize);

    const tick = () => {
      if (!callActiveRef.current) return;

      analyser.getByteTimeDomainData(data);

      let sumSquares = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sumSquares += v * v;
      }
      const rms = Math.sqrt(sumSquares / data.length);
      const now = Date.now();

      if (rms > SPEECH_RMS_THRESHOLD) {
        if (voiceStreakStartRef.current === null) voiceStreakStartRef.current = now;
        lastAboveThresholdRef.current = now;

        if (!recordingStartedRef.current) {
          beginActualRecording();
        }

        const streakDuration = now - voiceStreakStartRef.current;
        if (streakDuration >= MIN_UNBROKEN_SPEECH_MS) {
          hasSpokenRef.current = true;
        }
        lastSpeechTimeRef.current = now;
      } else if (voiceStreakStartRef.current !== null) {
        const quietFor = now - (lastAboveThresholdRef.current || now);
        if (quietFor > HANGOVER_MS) {
          voiceStreakStartRef.current = null;
        }
      }

      const elapsedSinceStart = now - recordingStartRef.current;
      const silenceSinceSpeech = now - lastSpeechTimeRef.current;

      const shouldStopForSilence = hasSpokenRef.current && silenceSinceSpeech > SILENCE_AFTER_SPEECH_MS;
      const shouldStopNoSpeech = !hasSpokenRef.current && elapsedSinceStart > INITIAL_SILENCE_TIMEOUT_MS;
      const shouldStopMaxTime = recordingStartedRef.current && elapsedSinceStart > MAX_RECORDING_MS;

      if (shouldStopForSilence || shouldStopMaxTime) {
        console.log(
          `[VAD] stopping turn — hasSpoken=${hasSpokenRef.current}, reason=${
            shouldStopForSilence ? "silence-after-speech" : "max-time"
          }`
        );
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          try { mediaRecorderRef.current.stop(); } catch {}
        }
        return;
      }

      if (shouldStopNoSpeech) {
        console.log("[VAD] no speech detected within timeout — listening again");
        startRecordingTurn();
        return;
      }

      if (!tick.lastLog || now - tick.lastLog > 400) {
        tick.lastLog = now;
        const streakMs = voiceStreakStartRef.current ? now - voiceStreakStartRef.current : 0;
        console.log(
          `[VAD] rms=${rms.toFixed(4)} threshold=${SPEECH_RMS_THRESHOLD} streakMs=${streakMs} hasSpoken=${hasSpokenRef.current} recording=${recordingStartedRef.current}`
        );
      }

      vadFrameRef.current = requestAnimationFrame(tick);
    };

    vadFrameRef.current = requestAnimationFrame(tick);
  };

  const handleTurnRecordingStop = async () => {
    cancelAnimationFrame(vadFrameRef.current);
    if (!callActiveRef.current) return;

    if (!hasSpokenRef.current) {
      startRecordingTurn();
      return;
    }

    setCallPhase("thinking");
    setStatusText("Transcribing...");

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");

    try {
      const { data } = await api.post("/conversation/transcribe", formData, {
        headers: { "Content-Type": undefined },
      });

      const text = (data.text || "").trim();
      const normalized = text.toLowerCase();
      console.log(`[Transcribe] raw="${text}"`);

      if (!text || HALLUCINATION_PHRASES.has(normalized)) {
        setStatusText("Didn't catch that, try again");
        if (callActiveRef.current) startRecordingTurn();
        return;
      }

      await handleTurnComplete(text);
    } catch (err) {
      console.error(err);
      setStatusText("⚠️ Transcription failed. Check backend / GROQ_API_KEY.");
      if (callActiveRef.current) startRecordingTurn();
    }
  };

  const handleTurnComplete = async (text) => {
    setStatusText("Thinking...");

    const userMsg = { role: "You", text };
    const newHistory = [...messagesRef.current, userMsg];
    setMessages(newHistory);

    const currentPrompt = isLeveled ? levelQuestionsRef.current[promptIndexRef.current] : null;

    try {
      const { data } = await api.post("/conversation/turn", {
        category,
        level: isLeveled ? viewingLevel : (user?.level || "basic"),
        userText: text,
        history: newHistory.map((m) => ({ role: m.role, text: m.text })),
        // Extra context for leveled call practice — backend can use this to
        // grade the answer against the specific prompt instead of freeform.
        ...(currentPrompt ? { promptIndex: currentPrompt.index, promptText: currentPrompt.q } : {}),
      });

      const aiMsg = {
        role: "AI",
        text: data.aiReply,
        hasError: data.hasError,
        correction: data.correction,
        explanation: data.explanation,
      };
      setMessages((prev) => [...prev, aiMsg]);

      const speechText = data.hasError
        ? `Quick tip — ${data.correction}. ${data.aiReply}`
        : data.aiReply;

      speak(speechText, isLeveled ? () => advanceLevelFlow() : undefined);
    } catch (err) {
      console.error(err);
      setStatusText("Error talking to AI. Check backend is running.");
      if (callActiveRef.current) startRecordingTurn();
    }
  };

  // onDone: what to do once the TTS finishes. Defaults to listening again
  // (freeform chat). Leveled flow passes its own next-step callback.
  const speak = (text, onDone) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = user?.level === "advanced" ? 1.05 : user?.level === "basic" ? 0.85 : 0.95;

    setCallPhase("speaking");
    setStatusText("🔊 AI is speaking...");

    const proceed = () => {
      if (!callActiveRef.current) return;
      setTimeout(() => (onDone ? onDone() : startRecordingTurn()), 400);
    };

    utterance.onend = proceed;
    utterance.onerror = proceed;

    window.speechSynthesis.speak(utterance);
  };

  const scoreCount = messagesRef.current.filter((m) => m.role === "AI" && !m.hasError).length;

  return (
    <div className="call-page">
      <div className="call-header">
        <button onClick={() => navigate("/categories")}>← Back</button>
        <h2>{category.toUpperCase()} practice call</h2>
        {isLeveled && (
          <span className="call-level-badge">Level {viewingLevel} of {totalLevels}</span>
        )}
        <button onClick={() => navigate("/")} className="call-home-link">🏠 Home</button>
      </div>

      <div className="chat-window">
        {isLeveled && loadingLevel && messages.length === 0 && (
          <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}>Loading level…</p>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role === "You" ? "you" : "ai"}`}>
            <p>{m.text}</p>
            {m.hasError && (
              <div className="correction-box">
                <div className="correction-row">
                  <span className="correction-icon">✏️</span>
                  <span><strong>Correction:</strong> {m.correction}</span>
                </div>
                <div className="correction-row">
                  <span className="correction-icon">💡</span>
                  <span>{m.explanation}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {callPhase === "thinking" && (
          <div className="bubble ai typing-bubble">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </div>
        )}

        {isLeveled && levelFinished && (
          <div className="level-finish-overlay">
            <h3>🎉 Level Complete!</h3>
            <p>You answered all {levelQuestions.length} prompts.</p>
            <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
              {advancing
                ? "Updating your progress…"
                : viewingLevel < totalLevels
                ? `Level ${viewingLevel + 1} is now unlocked.`
                : "You've completed all levels! 🏆"}
            </p>
            <div className="level-finish-actions">
              <button className="tp-send-btn" onClick={() => { endCall(); navigate("/categories"); }}>
                Back to Categories
              </button>
              <button className="tp-send-btn tp-next-btn" onClick={practiceLevelAgain} disabled={advancing}>
                Practice Again
              </button>
              {viewingLevel < totalLevels && (
                <button className="tp-send-btn tp-next-btn" onClick={goToNextLevel} disabled={advancing}>
                  Next Level →
                </button>
              )}
              {certificateEarned && !advancing && (
                <button className="tp-send-btn tp-next-btn" onClick={() => navigate(`/mastery/${category}`)}>
                  🏆 View Your Reward
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="call-controls">
        <p className="status">{statusText}</p>

        {!callActive ? (
          <button
            className="mic-btn"
            onClick={startCall}
            disabled={isLeveled && (loadingLevel || levelQuestions.length === 0)}
          >
            📞
          </button>
        ) : (
          <button
            className={`mic-btn ${callPhase === "listening" ? "listening" : ""}`}
            onClick={endCall}
            title="End call"
          >
            {callPhase === "thinking" ? "⏳" : callPhase === "speaking" ? "🔊" : "🔴"}
          </button>
        )}
      </div>

      <style>{`
        /* ══════════════════════════════════════════════
           CALL PRACTICE PAGE — matches homepage theme
           (embedded directly here, no external css needed)
           ══════════════════════════════════════════════ */

        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          background: #050a08;
        }

        .call-page {
          --bg-primary: #050a08;
          --bg-secondary: #0e1f19;
          --bg-tertiary: #070d0a;
          --accent-1: #10b981;
          --accent-2: #059669;
          --accent-3: #d4af37;
          --accent-4: #b8860b;
          --glass-bg: rgba(255,255,255,0.05);
          --glass-border: rgba(255,255,255,0.09);
          --text-primary: #ffffff;
          --text-secondary: rgba(255,255,255,0.62);
          --text-muted: rgba(255,255,255,0.35);
          --shadow-glow: rgba(16,185,129,0.28);
          --radius-sm: 10px;
          --radius-md: 16px;

          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          margin: 0;
          border-radius: 0;
          max-width: none;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary), var(--bg-tertiary));
          color: var(--text-primary);
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
          z-index: 1;
        }

        .call-page::before,
        .call-page::after {
          content: '';
          position: fixed;
          border-radius: 50%;
          filter: blur(130px);
          opacity: 0.22;
          z-index: 0;
          pointer-events: none;
        }
        .call-page::before {
          width: 520px; height: 520px;
          background: radial-gradient(circle, var(--accent-1), var(--accent-2));
          top: -140px; left: -140px;
        }
        .call-page::after {
          width: 420px; height: 420px;
          background: radial-gradient(circle, var(--accent-3), var(--accent-4));
          bottom: -120px; right: -120px;
        }

        .call-header {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 16px;
          padding: 20px 28px;
          background: rgba(8, 20, 15, 0.75);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid var(--glass-border);
        }
        .call-header button {
          padding: 9px 16px;
          border-radius: var(--radius-sm);
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.12);
          color: var(--text-primary);
          font-weight: 600; font-size: 14px;
          cursor: pointer;
          transition: all 0.25s;
          font-family: inherit;
        }
        .call-header button:hover {
          border-color: var(--accent-1);
          background: rgba(16,185,129,0.1);
          transform: translateY(-1px);
        }
        .call-header h2 {
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -0.3px;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-3));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .call-level-badge {
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.35);
          color: var(--accent-1);
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }
        .call-home-link {
          margin-left: auto;
        }

        .chat-window {
          position: relative; z-index: 1;
          flex: 1;
          overflow-y: auto;
          padding: 40px 60px 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 1100px;
          width: 100%;
          margin: 0 auto;
        }
        .chat-window::-webkit-scrollbar { width: 6px; }
        .chat-window::-webkit-scrollbar-thumb {
          background: rgba(16,185,129,0.35);
          border-radius: 10px;
        }

        @media (min-width: 1400px) {
          .chat-window { max-width: 1300px; }
        }

        .bubble {
          max-width: 65%;
          padding: 16px 20px;
          border-radius: var(--radius-md);
          font-size: 15.5px;
          line-height: 1.6;
          border: 1px solid var(--glass-border);
          animation: bubbleIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          word-wrap: break-word;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .bubble:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }
        @keyframes bubbleIn {
          0%   { opacity: 0; transform: translateY(16px) scale(0.9); }
          60%  { opacity: 1; transform: translateY(-2px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .bubble.you {
          align-self: flex-end;
          background: linear-gradient(135deg, rgba(16,185,129,0.22), rgba(5,150,105,0.18));
          border-color: rgba(16,185,129,0.35);
          border-bottom-right-radius: 6px;
          animation-name: bubbleInRight;
        }
        @keyframes bubbleInRight {
          0%   { opacity: 0; transform: translateX(24px) scale(0.9); }
          60%  { opacity: 1; transform: translateX(-3px) scale(1.02); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }

        .bubble.ai {
          align-self: flex-start;
          background: var(--glass-bg);
          border-bottom-left-radius: 6px;
          animation-name: bubbleInLeft;
        }
        @keyframes bubbleInLeft {
          0%   { opacity: 0; transform: translateX(-24px) scale(0.9); }
          60%  { opacity: 1; transform: translateX(3px) scale(1.02); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        .bubble p { color: var(--text-primary); }

        .typing-bubble {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 16px 20px;
        }
        .typing-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: var(--accent-1);
          opacity: 0.5;
          animation: typingBounce 1.2s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        .correction-box {
          margin-top: 12px;
          padding: 12px 14px;
          border-radius: var(--radius-sm);
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.28);
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--text-secondary);
        }
        .correction-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .correction-row + .correction-row {
          margin-top: 8px;
        }
        .correction-icon {
          flex-shrink: 0;
          line-height: 1.6;
        }
        .correction-row span:last-child {
          flex: 1;
          word-break: break-word;
        }
        .correction-box strong { color: var(--accent-3); }

        .level-finish-overlay {
          align-self: center;
          margin-top: 20px;
          padding: 28px 32px;
          border-radius: var(--radius-md);
          background: rgba(10, 25, 19, 0.9);
          border: 1px solid var(--glass-border);
          text-align: center;
          max-width: 480px;
        }
        .level-finish-overlay h3 { margin: 0 0 6px; font-size: 20px; }
        .level-finish-actions {
          margin-top: 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
        .tp-send-btn {
          padding: 10px 18px;
          border-radius: var(--radius-sm);
          border: 1.5px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
          color: var(--text-primary);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tp-send-btn:hover { border-color: var(--accent-1); background: rgba(16,185,129,0.12); }
        .tp-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .tp-next-btn {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          border-color: transparent;
        }

        .call-controls {
          position: relative; z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          padding: 28px 20px 40px;
          background: rgba(8, 20, 15, 0.6);
          backdrop-filter: blur(20px);
          border-top: 1px solid var(--glass-border);
        }

        .status {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          text-align: center;
          min-height: 20px;
        }

        .mic-btn {
          width: 76px; height: 76px;
          border-radius: 50%;
          border: none;
          font-size: 30px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          box-shadow: 0 8px 30px var(--shadow-glow);
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .mic-btn:hover {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 12px 40px rgba(16,185,129,0.45);
        }
        .mic-btn:active {
          transform: translateY(0) scale(0.96);
        }
        .mic-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .mic-btn.listening {
          background: linear-gradient(135deg, #ef4444, #b91c1c);
          box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4);
          animation: micPulse 1.4s ease-in-out infinite;
        }
        @keyframes micPulse {
          0%   { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.45), 0 8px 30px rgba(239, 68, 68, 0.4); }
          70%  { box-shadow: 0 0 0 18px rgba(239, 68, 68, 0), 0 8px 30px rgba(239, 68, 68, 0.4); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0), 0 8px 30px rgba(239, 68, 68, 0.4); }
        }

        @media (max-width: 600px) {
          .call-header { padding: 16px 20px; }
          .call-header h2 { font-size: 16px; }
          .call-level-badge { font-size: 12px; padding: 5px 10px; }
          .chat-window { padding: 24px 16px 20px; }
          .bubble { max-width: 88%; font-size: 14px; }
          .mic-btn { width: 68px; height: 68px; font-size: 26px; }
        }
      `}</style>
    </div>
  );
}