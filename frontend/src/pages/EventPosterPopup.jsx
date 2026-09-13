import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";
import { useAuth } from "../context/AuthContext.jsx";

// Live countdown to a target date, updating every second.
const useCountdown = (targetDate) => {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!targetDate) return;
    const tick = () => setRemaining(Math.max(0, new Date(targetDate) - new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return { days, hours, minutes, seconds };
};

export default function EventPosterPopup() {
  const { user, profileLoaded } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [event, setEvent] = useState(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!user || !profileLoaded) return;
    api
      .get("/event/popup-check")
      .then(({ data }) => {
        if (data.show) {
          setEvent(data.event);
          setVisible(true);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profileLoaded]);

  const { days, hours, minutes, seconds } = useCountdown(event?.startsAt);

  const dismiss = async () => {
    setClosing(true);
    setTimeout(() => setVisible(false), 350);
    try {
      await api.post("/event/popup-seen");
    } catch {}
  };

  const handleSetReminder = async () => {
    await dismiss();
  };

  if (!visible || !event) return null;

  return (
    <div className={`ep-overlay${closing ? " ep-closing" : ""}`}>
      <div className="ep-poster">
        <button className="ep-close" onClick={dismiss} aria-label="Close">✕</button>

        <div className="ep-starfield">
          {Array.from({ length: 30 }).map((_, i) => (
            <span key={i} className="ep-star" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
            }} />
          ))}
        </div>

        <div className="ep-rays" />

        <div className="ep-content">
          <div className="ep-eyebrow">⚡ New Weekly Event ⚡</div>
          <h1 className="ep-title">
            SpeakUp<br /><span className="ep-title-accent">Proficiency Challenge</span>
          </h1>
          <p className="ep-sub">
            A one-shot, professionally graded English exam — grammar, listening &amp; a
            timed writing task. Top 10 scorers win an official certificate.
          </p>

          <div className="ep-countdown">
            {[
              { v: days, l: "Days" },
              { v: hours, l: "Hrs" },
              { v: minutes, l: "Min" },
              { v: seconds, l: "Sec" },
            ].map((u) => (
              <div className="ep-countdown-box" key={u.l}>
                <div className="ep-countdown-num">{String(u.v).padStart(2, "0")}</div>
                <div className="ep-countdown-label">{u.l}</div>
              </div>
            ))}
          </div>

          <div className="ep-meta">
            Goes live {new Date(event.startsAt).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            {" · "}Open for 48 hours · One attempt only
          </div>

          <div className="ep-actions">
            <button className="ep-btn-secondary" onClick={dismiss}>Maybe later</button>
            <button className="ep-btn-primary" onClick={handleSetReminder}>🔔 Notify me when it's live</button>
          </div>
        </div>
      </div>

      <style>{`
        .ep-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(2,6,4,0.82);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: epFadeIn 0.35s ease both;
        }
        .ep-overlay.ep-closing { animation: epFadeOut 0.35s ease both; }
        @keyframes epFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes epFadeOut { from { opacity: 1; } to { opacity: 0; } }

        .ep-poster {
          position: relative;
          width: 100%; max-width: 480px;
          border-radius: 24px;
          overflow: hidden;
          background: radial-gradient(ellipse at top, #132a20 0%, #050a08 70%);
          border: 1px solid rgba(212,175,55,0.3);
          box-shadow: 0 30px 90px rgba(0,0,0,0.6), 0 0 60px rgba(16,185,129,0.15);
          animation: epPopIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
          font-family: 'Inter', system-ui, sans-serif;
        }
        @keyframes epPopIn {
          0% { opacity: 0; transform: scale(0.85) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .ep-close {
          position: absolute; top: 14px; right: 14px; z-index: 5;
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
          color: #fff; cursor: pointer; font-size: 13px;
        }

        .ep-starfield { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .ep-star {
          position: absolute; border-radius: 50%; background: #fff;
          opacity: 0.6; animation: epTwinkle 2.5s ease-in-out infinite;
        }
        @keyframes epTwinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.9; } }

        .ep-rays {
          position: absolute; top: -50%; left: 50%;
          width: 200%; height: 200%;
          transform: translateX(-50%);
          background: conic-gradient(from 0deg, transparent 0deg, rgba(212,175,55,0.08) 10deg, transparent 20deg, transparent 180deg, rgba(16,185,129,0.08) 190deg, transparent 200deg, transparent 360deg);
          animation: epRaysSpin 20s linear infinite;
          pointer-events: none;
        }
        @keyframes epRaysSpin { from { transform: translateX(-50%) rotate(0deg); } to { transform: translateX(-50%) rotate(360deg); } }

        .ep-content { position: relative; z-index: 1; padding: 36px 30px 30px; text-align: center; }

        .ep-eyebrow {
          font-size: 12px; font-weight: 800; letter-spacing: 2px;
          color: #f0d98a; margin-bottom: 14px;
          animation: epGlowPulse 2s ease-in-out infinite;
        }
        @keyframes epGlowPulse {
          0%, 100% { text-shadow: 0 0 8px rgba(240,217,138,0.4); }
          50% { text-shadow: 0 0 18px rgba(240,217,138,0.9); }
        }

        .ep-title {
          font-size: 26px; font-weight: 800; line-height: 1.25; margin-bottom: 14px;
          color: #fff;
        }
        .ep-title-accent {
          background: linear-gradient(135deg, #10b981, #d4af37);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .ep-sub { font-size: 13.5px; color: rgba(255,255,255,0.65); line-height: 1.6; margin-bottom: 24px; }

        .ep-countdown { display: flex; justify-content: center; gap: 10px; margin-bottom: 18px; }
        .ep-countdown-box {
          width: 60px; padding: 10px 0; border-radius: 12px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(212,175,55,0.25);
        }
        .ep-countdown-num { font-size: 22px; font-weight: 800; color: #fff; font-variant-numeric: tabular-nums; }
        .ep-countdown-label { font-size: 9.5px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.45); margin-top: 2px; }

        .ep-meta { font-size: 11.5px; color: rgba(255,255,255,0.4); margin-bottom: 24px; }

        .ep-actions { display: flex; flex-direction: column; gap: 10px; }
        .ep-btn-primary {
          padding: 13px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; font-weight: 800; font-size: 14px; cursor: pointer;
          box-shadow: 0 8px 25px rgba(16,185,129,0.35);
          transition: transform 0.2s;
        }
        .ep-btn-primary:hover { transform: translateY(-2px); }
        .ep-btn-secondary {
          padding: 11px; border-radius: 12px;
          background: transparent; border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.6); font-weight: 600; font-size: 13px; cursor: pointer;
        }

        @media (max-width: 480px) {
          .ep-title { font-size: 22px; }
          .ep-countdown-box { width: 52px; }
        }
      `}</style>
    </div>
  );
}