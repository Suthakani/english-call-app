import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";

export default function HallOfFame() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get("/tournament/hall-of-fame")
      .then(({ data }) => active && setEntries(data))
      .catch(() => active && setError("Could not load the Hall of Fame right now."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <div className="hof-page">
      <button className="hof-back" onClick={() => navigate("/")}>← Back to Home</button>

      <div className="hof-header">
        <div className="hof-crown">👑</div>
        <h1>Hall of Fame</h1>
        <p>One legend crowned per year — the highest honor on SpeakUp.</p>
      </div>

      {loading && <p className="hof-loading">Loading…</p>}
      {!loading && error && <p className="hof-loading">{error}</p>}
      {!loading && !error && entries.length === 0 && (
        <p className="hof-loading">No year has finished yet — the first Hall of Fame champion will appear here at year end.</p>
      )}

      <div className="hof-list">
        {entries.map((e, i) => (
          <div className={`hof-entry${i === 0 ? " hof-entry-latest" : ""}`} key={e.year}>
            <div className="hof-year">{e.year}</div>
            <img
              className="hof-avatar"
              src={e.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${e.username}`}
              alt=""
            />
            <div className="hof-info">
              <div className="hof-username">{e.username}</div>
              <div className="hof-points">{e.points} points</div>
            </div>
            <div className="hof-cert-id">{e.certId}</div>
          </div>
        ))}
      </div>

      <style>{`
        .hof-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #050a08, #0e1f19, #070d0a);
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 32px 24px 60px;
        }
        .hof-back {
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.12);
          color: #fff;
          padding: 9px 16px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }
        .hof-header { text-align: center; margin: 28px 0 36px; }
        .hof-crown { font-size: 52px; margin-bottom: 6px; }
        .hof-header h1 {
          font-size: 32px; font-weight: 800; margin-bottom: 8px;
          background: linear-gradient(135deg, #d4af37, #fff6d8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hof-header p { color: rgba(255,255,255,0.6); font-size: 14px; }
        .hof-loading { text-align: center; color: rgba(255,255,255,0.5); margin-top: 40px; }
        .hof-list { max-width: 560px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }
        .hof-entry {
          display: flex; align-items: center; gap: 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 18px;
          padding: 18px 20px;
        }
        .hof-entry-latest {
          border-color: rgba(212,175,55,0.5);
          background: linear-gradient(135deg, rgba(212,175,55,0.1), rgba(16,185,129,0.06));
          box-shadow: 0 0 30px rgba(212,175,55,0.15);
        }
        .hof-year { font-size: 22px; font-weight: 800; color: #d4af37; width: 60px; }
        .hof-avatar { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(212,175,55,0.4); }
        .hof-info { flex: 1; }
        .hof-username { font-size: 16px; font-weight: 700; }
        .hof-points { font-size: 12.5px; color: #6ee7b7; }
        .hof-cert-id { font-size: 10.5px; color: rgba(255,255,255,0.35); font-family: monospace; }
      `}</style>
    </div>
  );
}