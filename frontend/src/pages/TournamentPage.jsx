import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";

const TABS = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

const RANK_MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function TournamentPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("weekly");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get(`/tournament/${activeTab}/winners`)
      .then(({ data }) => {
        if (active) setRecords(data);
      })
      .catch(() => {
        if (active) setError("Could not load tournament results right now.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [activeTab]);

  return (
    <div className="tournament-page">
      <button className="tournament-back" onClick={() => navigate("/")}>← Back to Home</button>

      <div className="tournament-header">
        <h1>🏆 Tournaments</h1>
        <p>Top 10 finishers each period earn an official certificate.</p>
        <button className="tournament-hof-link" onClick={() => navigate("/hall-of-fame")}>
          👑 View Hall of Fame →
        </button>
      </div>

      <div className="tournament-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tournament-tab${activeTab === t.id ? " active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="tournament-loading">Loading…</p>}
      {!loading && error && <p className="tournament-loading">{error}</p>}
      {!loading && !error && records.length === 0 && (
        <p className="tournament-loading">No {activeTab} tournaments have finished yet — check back soon.</p>
      )}

      {!loading && !error && records.map((record) => (
        <div className="tournament-period-card" key={record.periodKey}>
          <div className="tournament-period-header">
            <span className="tournament-period-key">{record.periodKey}</span>
            <span className="tournament-period-dates">
              {new Date(record.periodStart).toLocaleDateString()} – {new Date(record.periodEnd).toLocaleDateString()}
            </span>
          </div>
          <div className="tournament-winners-list">
            {record.winners.map((w) => (
              <div className="tournament-winner-row" key={w.rank}>
                <span className="tournament-rank">{RANK_MEDALS[w.rank] || `#${w.rank}`}</span>
                <img
                  className="tournament-avatar"
                  src={w.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${w.username}`}
                  alt=""
                />
                <span className="tournament-username">{w.username}</span>
                <span className="tournament-points">{w.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <style>{`
        .tournament-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #050a08, #0e1f19, #070d0a);
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 32px 24px 60px;
        }
        .tournament-back {
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.12);
          color: #fff;
          padding: 9px 16px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }
        .tournament-header { text-align: center; margin: 28px 0 20px; }
        .tournament-header h1 {
          font-size: 30px; font-weight: 800; margin-bottom: 6px;
          background: linear-gradient(135deg, #10b981, #d4af37);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .tournament-header p { color: rgba(255,255,255,0.6); font-size: 14px; margin-bottom: 14px; }
        .tournament-hof-link {
          background: rgba(212,175,55,0.12);
          border: 1.5px solid rgba(212,175,55,0.35);
          color: #f0d98a;
          padding: 9px 18px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
        }
        .tournament-tabs {
          display: flex; justify-content: center; gap: 8px; margin-bottom: 24px;
        }
        .tournament-tab {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.65);
          padding: 9px 20px;
          border-radius: 999px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tournament-tab.active {
          background: linear-gradient(135deg, #10b981, #059669);
          border-color: transparent;
          color: #fff;
        }
        .tournament-loading { text-align: center; color: rgba(255,255,255,0.5); margin-top: 40px; }
        .tournament-period-card {
          max-width: 640px; margin: 0 auto 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 18px;
          padding: 20px 22px;
        }
        .tournament-period-header {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 14px;
        }
        .tournament-period-key { font-size: 17px; font-weight: 800; color: #d4af37; }
        .tournament-period-dates { font-size: 12px; color: rgba(255,255,255,0.45); }
        .tournament-winners-list { display: flex; flex-direction: column; gap: 8px; }
        .tournament-winner-row {
          display: flex; align-items: center; gap: 12px;
          padding: 8px 10px; border-radius: 10px;
          background: rgba(255,255,255,0.03);
        }
        .tournament-rank { width: 28px; text-align: center; font-weight: 700; }
        .tournament-avatar { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; }
        .tournament-username { flex: 1; font-weight: 600; font-size: 14px; }
        .tournament-points { font-size: 13px; color: #6ee7b7; font-weight: 700; }
      `}</style>
    </div>
  );
}