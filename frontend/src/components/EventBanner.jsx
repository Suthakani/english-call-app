import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";

export default function EventBanner() {
  const navigate = useNavigate();
  const [data, setData] = useState(null); // { event, hasSubmitted, myScore }

  useEffect(() => {
    let active = true;
    api.get("/event/current").then(({ data }) => active && setData(data)).catch(() => {});
    return () => { active = false; };
  }, []);

  if (!data) return null;
  const { event, hasSubmitted, myScore } = data;

  if (event.status === "upcoming") return null; // the poster popup already covers "upcoming"

  return (
    <div className={`evb-banner${event.status === "live" ? " evb-live" : ""}`}>
      <div className="evb-text">
        {event.status === "live" ? (
          hasSubmitted ? (
            <>✅ You scored <strong>{myScore}</strong> in this week's Proficiency Challenge — results after it closes.</>
          ) : (
            <>🔴 <strong>LIVE NOW</strong> — SpeakUp Proficiency Challenge is open. Top 10 win a certificate.</>
          )
        ) : (
          <>This week's Proficiency Challenge has ended — check the leaderboard for results.</>
        )}
      </div>
      {event.status === "live" && !hasSubmitted && (
        <button className="evb-btn" onClick={() => navigate("/event-challenge")}>Take the Challenge →</button>
      )}
      {event.status === "closed" && (
        <button className="evb-btn" onClick={() => navigate("/tournament")}>View Results →</button>
      )}

      <style>{`
        .evb-banner {
          display: flex; align-items: center; justify-content: space-between; gap: 14px;
          flex-wrap: wrap;
          padding: 12px 20px;
          background: rgba(212,175,55,0.1);
          border-bottom: 1px solid rgba(212,175,55,0.25);
          font-size: 13.5px;
          color: #f0d98a;
        }
        .evb-banner.evb-live {
          background: linear-gradient(90deg, rgba(16,185,129,0.15), rgba(212,175,55,0.1));
          animation: evbPulseBorder 2s ease-in-out infinite;
        }
        @keyframes evbPulseBorder {
          0%, 100% { border-bottom-color: rgba(16,185,129,0.25); }
          50% { border-bottom-color: rgba(16,185,129,0.6); }
        }
        .evb-text strong { color: #fff; }
        .evb-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          border: none; color: #fff; font-weight: 700; font-size: 13px;
          padding: 8px 16px; border-radius: 999px; cursor: pointer; white-space: nowrap;
        }
      `}</style>
    </div>
  );
}