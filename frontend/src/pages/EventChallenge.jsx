import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";

export default function EventChallenge() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [challenge, setChallenge] = useState(null);
  const [answers, setAnswers] = useState({});
  const [writingText, setWritingText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const autoSubmitted = useRef(false);

  useEffect(() => {
    let active = true;
    api
      .get("/event/challenge")
      .then(({ data }) => {
        if (!active) return;
        setChallenge(data);
        const startedAt = new Date(data.startedAt).getTime();
        const elapsed = (Date.now() - startedAt) / 1000;
        setSecondsLeft(Math.max(0, Math.round(data.durationSeconds - elapsed)));
      })
      .catch((err) => active && setError(err.response?.data?.message || "Could not load the challenge."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  // Overall countdown — one timer for the whole challenge.
  useEffect(() => {
    if (secondsLeft === null || result) return;
    if (secondsLeft <= 0) {
      if (!autoSubmitted.current) {
        autoSubmitted.current = true;
        handleSubmit(true);
      }
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, result]);

  const selectAnswer = (id, option) => {
    setAnswers((prev) => ({ ...prev, [id]: option }));
  };

  const allMcqs = challenge
    ? [
        ...challenge.grammarVocab,
        ...challenge.listening,
        ...challenge.imageVocab,
        ...challenge.idioms,
        ...challenge.reading.flatMap((rc) => rc.questions),
      ]
    : [];

  const allAnswered = challenge && allMcqs.every((q) => answers[q.id]) && writingText.trim().length > 0;

  const handleSubmit = async (isAutoSubmit = false) => {
    if (submitting) return;
    if (!isAutoSubmit && !allAnswered) return;
    setSubmitting(true);
    try {
      const { data } = await api.post("/event/submit", { answers, writingText });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit your attempt.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  if (loading) {
    return <div className="evc-page"><p className="evc-status">Loading challenge…</p></div>;
  }

  if (error && !result) {
    return (
      <div className="evc-page">
        <button className="evc-back" onClick={() => navigate("/")}>← Back to Home</button>
        <p className="evc-status">{error}</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="evc-page">
        <div className="evc-result-card">
          <div className="evc-result-trophy">📊</div>
          <h1>Attempt Submitted!</h1>
          <div className="evc-result-score">{result.totalScore} / {result.maxPossible}</div>
          <div className="evc-result-breakdown">
            <div>Objective Sections: <strong>{result.objectiveScore} / {result.objectiveMax}</strong></div>
            <div>Writing Task: <strong>{result.writingScore} / {result.writingMax}</strong></div>
          </div>
          {result.writingFeedback && <p className="evc-feedback">"{result.writingFeedback}"</p>}
          <p className="evc-note">Top 10 scorers this week will receive an official certificate once the event closes.</p>
          <button className="evc-btn-primary" onClick={() => navigate("/")}>Back to Home</button>
        </div>
        <style>{evcStyles}</style>
      </div>
    );
  }

  const renderMcq = (q, i, imageUrl) => (
    <div className="evc-question" key={q.id}>
      {imageUrl && <img className="evc-image" src={imageUrl} alt="" loading="lazy" />}
      {q.scenario && <div className="evc-scenario">{q.scenario}</div>}
      <div className="evc-question-text"><span className={`evc-diff evc-diff-${q.difficulty}`}>{q.difficulty}</span> {i + 1}. {q.q}</div>
      <div className="evc-options">
        {q.options.map((opt) => (
          <button
            key={opt}
            className={`evc-option${answers[q.id] === opt ? " selected" : ""}`}
            onClick={() => selectAnswer(q.id, opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="evc-page">
      <div className="evc-topbar">
        <button className="evc-back" onClick={() => navigate("/")}>← Back to Home</button>
        {secondsLeft !== null && (
          <div className={`evc-timer${secondsLeft <= 60 ? " evc-timer-warn" : ""}`}>⏱ {formatTime(secondsLeft)}</div>
        )}
      </div>
      <h1 className="evc-title">🏆 Proficiency Challenge</h1>
      <p className="evc-sub">One attempt only — answer everything before the timer runs out.</p>

      <div className="evc-section">
        <h2>Grammar &amp; Vocabulary</h2>
        {challenge.grammarVocab.map((q, i) => renderMcq(q, i))}
      </div>

      <div className="evc-section">
        <h2>Listening Comprehension</h2>
        {challenge.listening.map((q, i) => renderMcq(q, i))}
      </div>

      <div className="evc-section">
        <h2>Image Vocabulary</h2>
        {challenge.imageVocab.map((q, i) => renderMcq(q, i, q.imageUrl))}
      </div>

      <div className="evc-section">
        <h2>Idioms &amp; Phrasal Verbs</h2>
        {challenge.idioms.map((q, i) => renderMcq(q, i, q.imageUrl))}
      </div>

      <div className="evc-section">
        <h2>Reading Comprehension</h2>
        {challenge.reading.map((rc) => (
          <div key={rc.id} className="evc-reading-block">
            <img className="evc-image" src={rc.imageUrl} alt="" loading="lazy" />
            <p className="evc-passage">{rc.passage}</p>
            {rc.questions.map((q, i) => renderMcq(q, i))}
          </div>
        ))}
      </div>

      <div className="evc-section">
        <h2>Writing Task</h2>
        <p className="evc-prompt">{challenge.writingPrompt}</p>
        <textarea
          className="evc-textarea"
          rows={5}
          placeholder="Write your answer here…"
          value={writingText}
          onChange={(e) => setWritingText(e.target.value)}
        />
      </div>

      {error && <p className="evc-error">{error}</p>}

      <button className="evc-btn-primary evc-submit" onClick={() => handleSubmit(false)} disabled={!allAnswered || submitting}>
        {submitting ? "Submitting…" : "Submit Final Answers"}
      </button>

      <style>{evcStyles}</style>
    </div>
  );
}

const evcStyles = `
  .evc-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #050a08, #0e1f19, #070d0a);
    color: #fff;
    font-family: 'Inter', system-ui, sans-serif;
    padding: 28px 20px 60px;
    max-width: 700px;
    margin: 0 auto;
  }
  .evc-topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
  .evc-back {
    background: rgba(255,255,255,0.06);
    border: 1.5px solid rgba(255,255,255,0.12);
    color: #fff;
    padding: 9px 16px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
  }
  .evc-timer {
    font-weight: 800; font-size: 15px; padding: 8px 14px; border-radius: 10px;
    background: rgba(16,185,129,0.12); border: 1.5px solid rgba(16,185,129,0.4); color: #6ee7b7;
    font-variant-numeric: tabular-nums;
  }
  .evc-timer-warn { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.5); color: #fca5a5; }
  .evc-status { text-align: center; margin-top: 60px; color: rgba(255,255,255,0.6); }
  .evc-title {
    font-size: 26px; font-weight: 800; margin-bottom: 4px;
    background: linear-gradient(135deg, #10b981, #d4af37);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .evc-sub { color: rgba(255,255,255,0.55); font-size: 13px; margin-bottom: 28px; }
  .evc-section { margin-bottom: 34px; }
  .evc-section h2 { font-size: 16px; font-weight: 700; color: #f0d98a; margin-bottom: 16px; }
  .evc-question { margin-bottom: 22px; }
  .evc-image { width: 100%; max-height: 220px; object-fit: cover; border-radius: 12px; margin-bottom: 10px; display: block; }
  .evc-reading-block { margin-bottom: 10px; }
  .evc-passage { font-size: 13.5px; line-height: 1.6; color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.03); border-radius: 10px; padding: 14px 16px; margin-bottom: 18px; }
  .evc-scenario { font-size: 13px; color: rgba(255,255,255,0.6); font-style: italic; margin-bottom: 8px; padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: 10px; }
  .evc-question-text { font-size: 14.5px; font-weight: 600; margin-bottom: 10px; }
  .evc-diff { font-size: 9.5px; text-transform: uppercase; padding: 2px 7px; border-radius: 6px; margin-right: 8px; font-weight: 800; }
  .evc-diff-easy { background: rgba(16,185,129,0.15); color: #6ee7b7; }
  .evc-diff-medium { background: rgba(212,175,55,0.15); color: #f0d98a; }
  .evc-diff-hard { background: rgba(239,68,68,0.15); color: #fca5a5; }
  .evc-options { display: flex; flex-direction: column; gap: 8px; }
  .evc-option {
    text-align: left; padding: 11px 14px; border-radius: 10px;
    background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.1);
    color: #fff; font-size: 13.5px; cursor: pointer; transition: all 0.2s;
  }
  .evc-option:hover { border-color: rgba(16,185,129,0.4); }
  .evc-option.selected { background: rgba(16,185,129,0.15); border-color: #10b981; }
  .evc-prompt { font-size: 14px; color: rgba(255,255,255,0.75); margin-bottom: 12px; }
  .evc-textarea {
    width: 100%; padding: 14px; border-radius: 12px;
    background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.12);
    color: #fff; font-size: 14px; font-family: inherit; resize: vertical;
  }
  .evc-error { color: #f87171; font-size: 13px; margin-bottom: 14px; }
  .evc-btn-primary {
    width: 100%; padding: 15px; border-radius: 14px; border: none;
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff; font-weight: 800; font-size: 15px; cursor: pointer;
  }
  .evc-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .evc-result-card {
    max-width: 460px; margin: 60px auto 0; text-align: center;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(212,175,55,0.3);
    border-radius: 20px; padding: 40px 30px;
  }
  .evc-result-trophy { font-size: 48px; margin-bottom: 10px; }
  .evc-result-score {
    font-size: 40px; font-weight: 800; margin: 14px 0;
    background: linear-gradient(135deg, #10b981, #d4af37);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .evc-result-breakdown { font-size: 13.5px; color: rgba(255,255,255,0.7); margin-bottom: 14px; display: flex; flex-direction: column; gap: 4px; }
  .evc-feedback { font-size: 13px; font-style: italic; color: rgba(255,255,255,0.5); margin-bottom: 18px; }
  .evc-note { font-size: 12.5px; color: rgba(255,255,255,0.45); margin-bottom: 24px; }
`;