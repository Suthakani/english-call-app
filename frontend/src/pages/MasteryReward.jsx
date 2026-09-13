import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";

const CATEGORY_DISPLAY_NAMES = {
  dailyPractice: "Daily Practice",
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  listening: "Listening",
  pronunciation: "Pronunciation",
  speaking: "Speaking",
};

export default function MasteryReward() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [mastery, setMastery] = useState(null); // { title, unlockSlug, unlockTitle }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get(`/quiz/mastery/${category}`)
      .then(({ data }) => {
        if (active) setMastery(data);
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.status === 404
              ? "You haven't mastered this category yet — complete all 100 levels first."
              : "Could not load your reward right now."
          );
        }
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [category]);

  return (
    <div className="mastery-page">
      <button className="mastery-back" onClick={() => navigate("/")}>← Back to Categories</button>

      {loading && <p className="mastery-loading">Loading your reward…</p>}
      {!loading && error && <p className="mastery-loading">{error}</p>}

      {!loading && !error && mastery && (
        <div className="mastery-card">
          <div className="mastery-trophy">🏆</div>
          <p className="mastery-eyebrow">Category Mastered</p>
          <h1 className="mastery-title">{mastery.title}</h1>
          <p className="mastery-sub">
            You've completed all <strong>100 levels</strong> of {CATEGORY_DISPLAY_NAMES[category] || category}.
            This title is now shown permanently on your profile.
          </p>

          {mastery.unlockSlug && (
            <div className="mastery-unlock-box">
              <div className="mastery-unlock-label">🔓 New content unlocked</div>
              <div className="mastery-unlock-name">{mastery.unlockTitle}</div>
              <button
                className="mastery-unlock-btn"
                onClick={() => navigate(`/call/${mastery.unlockSlug}`)}
              >
                Try it now →
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        .mastery-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #050a08, #0e1f19, #070d0a);
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .mastery-back {
          align-self: flex-start;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.12);
          color: #fff;
          padding: 9px 16px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 40px;
        }
        .mastery-loading { color: rgba(255,255,255,0.6); margin-top: 60px; }
        .mastery-card {
          max-width: 460px;
          width: 100%;
          text-align: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 40px 32px;
          margin-top: 20px;
        }
        .mastery-trophy { font-size: 56px; margin-bottom: 8px; }
        .mastery-eyebrow {
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 12px;
          color: #d4af37;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .mastery-title {
          font-size: 30px;
          font-weight: 800;
          background: linear-gradient(135deg, #10b981, #d4af37);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 14px;
        }
        .mastery-sub {
          color: rgba(255,255,255,0.65);
          font-size: 14.5px;
          line-height: 1.6;
          margin-bottom: 28px;
        }
        .mastery-unlock-box {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: 14px;
          padding: 20px;
        }
        .mastery-unlock-label {
          font-size: 12px;
          color: #10b981;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }
        .mastery-unlock-name {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .mastery-unlock-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          border: none;
          color: #fff;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}