import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";
import { useAuth } from "../context/AuthContext.jsx";
import { playSound } from "../utils/sound.js";
const LEVEL_LABELS = { basic: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
const CATEGORY_DISPLAY_NAMES = {
  dailyPractice: "Daily Practice",
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  listening: "Listening",
  pronunciation: "Pronunciation",
};
// Categories that use the 100-level system instead of basic/intermediate/advanced.
const LEVELED_CATEGORIES = ["grammar", "vocabulary", "listening", "pronunciation", "dailyPractice"];
export default function TextPractice() {
  const { category: rawCategory } = useParams();
const category = rawCategory === "daily-practice" ? "dailyPractice" : rawCategory;
  const { user } = useAuth();
  const navigate = useNavigate();
  const normalizedCategory = category === "daily-practice" ? "dailyPractice" : category;
 const isLeveled = LEVELED_CATEGORIES.includes(normalizedCategory);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [totalLevels, setTotalLevels] = useState(100);
  const [viewingLevel, setViewingLevel] = useState(1); // level currently being played

  const level = isLeveled ? viewingLevel : (user?.level || "basic");
 
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null); // { correct, correctAnswer }
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [checking, setChecking] = useState(false);
  const [advancing, setAdvancing] = useState(false);
   const certificateEarned = isLeveled && finished && viewingLevel === totalLevels;
  useEffect(() => {
    setLoading(true);
    api.get(`/quiz/${category}/${level}`)
      .then(({ data }) => {
        setQuestions(data.questions || []);
        if (data.levelInfo) {
          setUnlockedLevel(data.levelInfo.unlockedLevel);
          setTotalLevels(data.levelInfo.totalLevels);
          // First load of a leveled category — jump straight to the level
          // the user has actually unlocked, not level 1.
          if (isLeveled && viewingLevel === 1 && data.levelInfo.unlockedLevel !== 1) {
            setViewingLevel(data.levelInfo.unlockedLevel);
          }
        }
      })
      .catch((err) => console.error("Failed to load quiz:", err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, level]);

  const current = questions[step];

  const goBackToCategories = () => {
    navigate("/");
    setTimeout(() => {
      document.getElementById("learning-categories")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const checkAnswer = async () => {
    if (!input.trim() || feedback || checking) return;
    setChecking(true);
    try {
      const { data } = await api.post("/quiz/check", {
        category,
        level,
        index: current.index,
        userAnswer: input.trim(),
      });
      setFeedback(data);
      playSound(data.correct ? 'correct' : 'wrong');
      if (data.correct) setScore((s) => s + 1);
    } catch (err) {
      console.error("Failed to check answer:", err);
    } finally {
      setChecking(false);
    }
  };

  const nextQuestion = async () => {
    // Guard against double-click / double-tap firing this twice in a row,
    // which would call complete-level multiple times and skip levels.
    if (advancing) return;
    setInput("");
    setFeedback(null);
    setShowHint(false);
    if (step + 1 < questions.length) {
      setStep((s) => s + 1);
    } else {
      setFinished(true);
      // Leveled category finished — try to unlock the next level.
      if (isLeveled) {
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
      }
    }
  };

  const restart = () => {
    setStep(0);
    setInput("");
    setFeedback(null);
    setShowHint(false);
    setScore(0);
    setFinished(false);
  };

  const goToNextLevel = () => {
    setViewingLevel((v) => Math.min(v + 1, totalLevels));
    restart();
  };

  if (loading) {
    return (
      <div className="tp-page">
        <div className="tp-card">
          <p style={{ color: "rgba(255,255,255,0.6)" }}>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="tp-page">
        <div className="tp-card">
          <button className="tp-back" onClick={goBackToCategories}>← Back to Categories</button>
          <p style={{ marginTop: 20, color: "rgba(255,255,255,0.6)" }}>
            No questions available yet for this category/level.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tp-page">
      <div className="tp-card">
        <div className="tp-header">
          <button className="tp-back" onClick={goBackToCategories}>← Back to Categories</button>
          <span className="tp-level">
            {isLeveled ? `Level ${viewingLevel} of ${totalLevels}` : (LEVEL_LABELS[level] || level)}
          </span>
        </div>

        <h2 className="tp-title">
  {CATEGORY_DISPLAY_NAMES[category] || category} Practice
</h2>

        {!finished ? (
          <>
            <div className="tp-progress">
              <div className="tp-progress-bar" style={{ width: `${(step / questions.length) * 100}%` }} />
            </div>
            <div className="tp-progress-label">Question {step + 1} of {questions.length}</div>

            <div className="tp-question-box">
              <p className="tp-question">{current.q}</p>

              {showHint && (
                <div className="tp-hint">💡 Hint: {current.hint}</div>
              )}

              <div className="tp-input-row">
                <input
                  className="tp-input"
                  type="text"
                  placeholder="Type your answer..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") checkAnswer(); }}
                  disabled={!!feedback || checking}
                />
                {!feedback ? (
                  <button className="tp-send-btn" onClick={checkAnswer} disabled={!input.trim() || checking}>
                    {checking ? "…" : "Check"}
                  </button>
                ) : (
                  <button
                    className="tp-send-btn tp-next-btn"
                    onClick={nextQuestion}
                    disabled={advancing}
                  >
                    {advancing ? "…" : (step + 1 < questions.length ? "Next →" : "Finish →")}
                  </button>
                )}
              </div>

              {!feedback && (
                <button className="tp-hint-btn" onClick={() => setShowHint(true)}>
                  Need a hint?
                </button>
              )}

              {feedback && (
                <div className={`tp-feedback ${feedback.correct ? "tp-feedback-correct" : "tp-feedback-wrong"}`}>
                  {feedback.correct
                    ? "✓ Correct! Well done."
                    : `✗ Not quite. Correct answer: "${feedback.correctAnswer}"`}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="tp-finish-box">
            <h3>🎉 Level Complete!</h3>
            <p>You scored {score} out of {questions.length}.</p>
            {isLeveled && (
              <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                {advancing
                  ? "Updating your progress…"
                  : viewingLevel < totalLevels
                  ? `Level ${viewingLevel + 1} is now unlocked.`
                  : "You've completed all levels! 🏆"}
              </p>
            )}
            <div className="tp-finish-actions">
              <button className="tp-send-btn" onClick={goBackToCategories}>Back to Categories</button>
              <button className="tp-send-btn tp-next-btn" onClick={restart}>Practice Again</button>
              {isLeveled && viewingLevel < totalLevels && (
                <button className="tp-send-btn tp-next-btn" onClick={goToNextLevel} disabled={advancing}>
                  Next Level →
                </button>
              )}
              {certificateEarned && !advancing && (
        <button
          className="tp-send-btn tp-next-btn"
          onClick={() => navigate(`/certificate/${category}`)}
        >
          🎓 View Certificate
        </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}