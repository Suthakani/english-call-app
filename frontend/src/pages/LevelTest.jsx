import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../homepage.css";

export default function LevelTest() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();

  useEffect(() => {
    api
      .get("/test/questions")
      .then(({ data }) => setQuestions(data))
      .finally(() => setLoadingQuestions(false));
  }, []);

  const handleChange = (qId, value) => setAnswers({ ...answers, [qId]: value });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = Object.entries(answers).map(([questionId, userAnswer]) => ({ questionId, userAnswer }));
      const { data } = await api.post("/test/submit", { answers: payload });
      setResult(data);
      updateUser({ level: data.assignedLevel });
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong grading the test");
    } finally {
      setLoading(false);
    }
  };

  const pageWrap = children => (
    <div className="homepage-body" style={{ minHeight: "100vh", padding: "60px 20px" }}>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <div className="noise"></div>
      <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );

  if (result) {
    return pageWrap(
      <>
        <div className="section-header" style={{ margin: "0 0 40px" }}>
          <div className="section-tag">🎉 RESULT</div>
          <h1 className="section-title">Test <span className="gradient-text">Complete!</span></h1>
          <p className="section-desc">
            Score: {result.score} / {result.totalQuestions} &nbsp;·&nbsp; Your level:{" "}
            <strong style={{ color: "#f0d98a" }}>{result.assignedLevel.toUpperCase()}</strong>
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
          {result.detailedResults.map((r, i) => (
            <div
              key={r.questionId}
              className="feature-card"
              style={{
                borderLeft: `4px solid ${r.isCorrect ? "#10b981" : "#f87171"}`,
                textAlign: "left",
              }}
            >
              <p style={{ fontWeight: 700, marginBottom: 10 }}>Q{i + 1}. {r.sentence}</p>
              <p style={{ marginBottom: 6, color: "var(--text-secondary)" }}>
                <strong style={{ color: "#fff" }}>Your answer:</strong>{" "}
                {r.yourAnswer || <em>(empty)</em>}
              </p>
              <p style={{ marginBottom: 10, color: "var(--text-secondary)" }}>
                <strong style={{ color: "#fff" }}>Correct answer:</strong> {r.correctAnswer}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {r.isCorrect ? "✅" : "❌"} {r.feedback}
              </p>
            </div>
          ))}
        </div>

        <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => navigate("/categories")}>
          Choose what to practice →
        </button>
      </>
    );
  }

  if (loadingQuestions) {
    return pageWrap(
      <div className="section-header" style={{ margin: 0 }}>
        <div className="section-tag">QUICK CHECK</div>
        <h1 className="section-title">Quick Level <span className="gradient-text">Check</span></h1>
        <p className="section-desc">Generating your test in {user?.nativeLanguage || "your language"}…</p>
      </div>
    );
  }

  return pageWrap(
    <>
      <div className="section-header" style={{ margin: "0 0 40px" }}>
        <div className="section-tag">QUICK CHECK</div>
        <h1 className="section-title">Quick Level <span className="gradient-text">Check</span></h1>
        <p className="section-desc">
          Unga native language ({user?.nativeLanguage}) la oru sentence varum, adha correct ah English la type
          pannunga. Ungala match panra category kandupudika idhu help pannும்.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
        {questions.map((q, i) => (
          <div key={q.id} className="feature-card" style={{ textAlign: "left" }}>
            <p style={{ fontWeight: 700, marginBottom: 12 }}>Q{i + 1}. {q.sentence}</p>
            <textarea
              rows={2}
              className="form-textarea"
              placeholder="Type the English translation here..."
              value={answers[q.id] || ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
              style={{ minHeight: 60 }}
            />
          </div>
        ))}
      </div>

      <button
        className="btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
        disabled={Object.keys(answers).length < questions.length || loading}
        onClick={handleSubmit}
      >
        {loading ? "Grading with AI..." : "Submit Test"}
      </button>
    </>
  );
}