
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axiosConfig.js";
import "./VerifyCertificate.css";

const CATEGORY_DISPLAY_NAMES = {
  dailyPractice: "Daily Practice",
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  listening: "Listening",
  pronunciation: "Pronunciation",
  speaking: "Speaking",
};

const PERIOD_TYPE_LABELS = { weekly: "Weekly", monthly: "Monthly", yearly: "Yearly" };

// Builds the rows shown for a verified certificate, based on its type —
// mirrors the logic in Certificate.jsx so the public verify page and the
// learner's own certificate view always agree on what a cert represents.
const buildVerifyRows = (result) => {
  if (!result) return [];
  switch (result.type) {
    case "champion":
      return [{ label: "Achievement", value: `Champion — Leaderboard Cycle #${(result.cycleIndex ?? 0) + 1}` }];
    case "tournament":
      return [
        { label: "Achievement", value: `Rank #${result.rank} — ${PERIOD_TYPE_LABELS[result.periodType] || ""} Tournament` },
        { label: "Period", value: result.periodKey },
      ];
    case "event":
      return [
        { label: "Achievement", value: `Rank #${result.rank} — Proficiency Challenge` },
        { label: "Period", value: result.periodKey },
      ];
    case "hall-of-fame":
      return [{ label: "Achievement", value: `Hall of Fame Champion — ${result.periodKey}` }];
    case "quiz":
    default:
      return [
        { label: "Category", value: CATEGORY_DISPLAY_NAMES[result.category] || result.category },
        { label: "Levels Completed", value: "100" },
      ];
  }
};

// PUBLIC page — this is what a QR code on a certificate opens. No login
// required (mirrors the backend's public /api/quiz/verify/:certId route).
// Anyone — the learner, an employer, anyone with the link — can land
// here and see whether a certificate is genuine.
export default function VerifyCertificate() {
  const { certId } = useParams();
  const [result, setResult] = useState(null); // backend response
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get(`/quiz/verify/${certId}`)
      .then(({ data }) => {
        if (active) setResult(data);
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message ||
              "This certificate ID could not be found. It may be invalid or mistyped."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [certId]);

  return (
    <div className="verify-page">
      <div className="verify-card">
        <div className="verify-brand">
          <div className="verify-logo">SK</div>
          <div>
            <div className="verify-brand-name">SpeakUp</div>
            <div className="verify-brand-tagline">Certificate Verification</div>
          </div>
        </div>

        {loading && <p className="verify-loading">Checking certificate…</p>}

        {!loading && error && (
          <div className="verify-result verify-invalid">
            <div className="verify-icon verify-icon-invalid">✕</div>
            <h2>Not Verified</h2>
            <p className="verify-message">{error}</p>
          </div>
        )}

        {!loading && result?.valid && (
          <div className="verify-result verify-valid">
            <div className="verify-icon verify-icon-valid">✓</div>
            <h2>Certificate Verified</h2>
          
            <p className="verify-message">
              This is a genuine certificate issued by SpeakUp.
            </p>

            <div className="verify-seal-row">
              <svg className="verify-seal-svg" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <path id="verifySealTextPath" d="M 80,80 m -62,0 a 62,62 0 1,1 124,0 a 62,62 0 1,1 -124,0" />
                  <filter id="verifyStampInk" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" />
                  </filter>
                </defs>
                <g className="verify-seal-stamp" filter="url(#verifyStampInk)">
                  <circle cx="80" cy="80" r="76" fill="none" stroke="#1d3a8f" strokeWidth="3" />
                  <circle cx="80" cy="80" r="69" fill="none" stroke="#1d3a8f" strokeWidth="1.5" />
                  <circle cx="80" cy="80" r="47" fill="none" stroke="#1d3a8f" strokeWidth="2.5" />
                  <text className="verify-seal-curve-text">
                    <textPath href="#verifySealTextPath" startOffset="0%">
                      ✦ SPEAKUP ✦ OFFICIAL SEAL ✦ VERIFIED ✦
                    </textPath>
                  </text>
                  <text x="80" y="76" textAnchor="middle" className="verify-seal-center-text">SK</text>
                  <text x="80" y="94" textAnchor="middle" className="verify-seal-center-year">EST. 2026</text>
                </g>
              </svg>

              <svg className="verify-signature-svg" viewBox="0 0 260 80" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="verifyInkTexture" x="-10%" y="-30%" width="120%" height="160%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4" result="n" />
                    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.1" />
                  </filter>
                </defs>
                <text
                  x="130"
                  y="48"
                  textAnchor="middle"
                  filter="url(#verifyInkTexture)"
                  style={{ fontFamily: "'Alex Brush', 'Great Vibes', cursive", fontSize: "44px", fill: "#12244f" }}
                >
                  SuthaKrish
                </text>
                <path
                  d="M20,58 C60,66 100,64 140,60 C180,56 220,58 244,54"
                  fill="none"
                  stroke="#12244f"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  opacity="0.75"
                  filter="url(#verifyInkTexture)"
                />
              </svg>
            </div>
            <div className="verify-seal-caption">
              <span>Official Seal</span>
              <span>Founder, SpeakUp</span>
            </div>

            <div className="verify-details">
              <div className="verify-row">
                <span>Name</span>
                <strong>{result.username}</strong>
              </div>
              {buildVerifyRows(result).map((row) => (
                <div className="verify-row" key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
              <div className="verify-row">
                <span>Date Issued</span>
                <strong>
                  {new Date(result.issuedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </div>
              <div className="verify-row">
                <span>Certificate ID</span>
                <strong>{result.certId}</strong>
              </div>
            </div>
          </div>
        )}

        <Link to="/" className="verify-home-link">← Back to SpeakUp</Link>
      </div>
    </div>
  );
}