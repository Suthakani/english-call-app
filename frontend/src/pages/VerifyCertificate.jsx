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

            <div className="verify-details">
              <div className="verify-row">
                <span>Name</span>
                <strong>{result.username}</strong>
              </div>
              <div className="verify-row">
                <span>Category</span>
                <strong>{CATEGORY_DISPLAY_NAMES[result.category] || result.category}</strong>
              </div>
              <div className="verify-row">
                <span>Levels Completed</span>
                <strong>100</strong>
              </div>
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