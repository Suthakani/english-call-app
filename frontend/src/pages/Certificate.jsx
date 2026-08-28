import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axiosConfig.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Certificate.css";

const CATEGORY_DISPLAY_NAMES = {
  dailyPractice: "Daily Practice",
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  listening: "Listening",
  pronunciation: "Pronunciation",
};

// ── Customize these to match your brand ──
const COMPANY_NAME = "SpeakUp";
const COMPANY_TAGLINE = "Learn English Confidently";
const SIGNER_NAME = "SuthaKrish";
const SIGNER_TITLE = "Founder, SpeakUp";

export default function Certificate() {
  const { category: rawCategory } = useParams();
  const category = rawCategory === "daily-practice" ? "dailyPractice" : rawCategory;
  const { user } = useAuth();
  const navigate = useNavigate();
  const certRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  // NOTE: the User model (backend/models/User.js) stores the learner's
  // name under `username`, not `name` — there is no `name` field on the
  // schema at all. `user?.username` is what profile.jsx already reads
  // too, so this keeps them consistent.
  const learnerName = user?.username || "Learner";

  // ── Real certificate data from the backend ──
  // certId and issuedAt now come from the server (backend/models/User.js
  // `certificates` subdocument), not computed client-side, so the QR
  // code always points at a certId the /verify endpoint actually
  // recognizes. While this is loading we show a lightweight placeholder
  // instead of the full certificate, to avoid flashing a fake/incorrect
  // certId that wouldn't match what verifyCertificate returns.
  const [certData, setCertData] = useState(null); // { certId, issuedAt, username }
  const [loadingCert, setLoadingCert] = useState(true);
  const [certError, setCertError] = useState("");

  useEffect(() => {
    let active = true;
    setLoadingCert(true);
    setCertError("");
    api
      .get(`/quiz/certificate/${category}`)
      .then(({ data }) => {
        if (active) setCertData(data);
      })
      .catch((err) => {
        if (active) {
          setCertError(
            err.response?.status === 404
              ? "You haven't earned this certificate yet — complete all 100 levels first."
              : "Could not load your certificate right now."
          );
        }
      })
      .finally(() => {
        if (active) setLoadingCert(false);
      });
    return () => {
      active = false;
    };
  }, [category]);

  const dateStr = certData?.issuedAt
    ? new Date(certData.issuedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const certId = certData?.certId || "";

  // The QR code now encodes a real, scannable verification LINK instead
  // of plain text. Scanning it opens /verify/:certId on this site, which
  // hits the public backend endpoint and shows a "✅ Verified" page —
  // works for anyone, logged in or not.
  const verifyUrl = certId ? `${window.location.origin}/verify/${certId}` : "";

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2.5,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const y = Math.max(0, (pdfHeight - imgHeight) / 2);

      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      pdf.save(`${CATEGORY_DISPLAY_NAMES[category] || category}-Certificate.pdf`);
    } catch (err) {
      console.error("Failed to generate certificate PDF:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loadingCert) {
    return (
      <div className="cert-page">
        <button className="tp-back" onClick={() => navigate("/")}>← Back to Categories</button>
        <p className="cert-loading-text">Loading your certificate…</p>
      </div>
    );
  }

  if (certError) {
    return (
      <div className="cert-page">
        <button className="tp-back" onClick={() => navigate("/")}>← Back to Categories</button>
        <p className="cert-loading-text">{certError}</p>
      </div>
    );
  }

  return (
    <div className="cert-page">
      <button className="tp-back" onClick={() => navigate("/")}>← Back to Categories</button>

      <div className="cert-frame" ref={certRef}>
        <div className="cert-border">
          {/* corner flourishes */}
          <span className="cert-corner cert-corner-tl" />
          <span className="cert-corner cert-corner-tr" />
          <span className="cert-corner cert-corner-bl" />
          <span className="cert-corner cert-corner-br" />

          {/* watermark */}
          <div className="cert-watermark">SK</div>

          {/* header: logo + company */}
          <div className="cert-brand">
            <div className="cert-logo">SK</div>
            <div className="cert-brand-text">
              <div className="cert-brand-name">{COMPANY_NAME}</div>
              <div className="cert-brand-tagline">{COMPANY_TAGLINE}</div>
            </div>
          </div>

          <p className="cert-eyebrow">Certificate of Achievement</p>
          <div className="cert-divider" />

          <p className="cert-presented">This certificate is proudly presented to</p>
          <h1 className="cert-name">{learnerName}</h1>

          <p className="cert-body">
            for successfully completing all <strong>100 levels</strong> in
          </p>
          <h2 className="cert-category">
            {CATEGORY_DISPLAY_NAMES[category] || category}
          </h2>
          <p className="cert-body cert-subtext">
            demonstrating consistent dedication and measurable improvement in English proficiency.
          </p>

          {/* footer: date | seal | signature */}
          <div className="cert-footer">
            <div className="cert-footer-block">
              <div className="cert-line" />
              <div className="cert-footer-label">{dateStr}</div>
              <div className="cert-footer-caption">Date Issued</div>
            </div>

            <div className="cert-seal">
              <svg className="cert-seal-svg" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <path id="sealTextPath" d="M 80,80 m -62,0 a 62,62 0 1,1 124,0 a 62,62 0 1,1 -124,0" />
                  <radialGradient id="sealFace" cx="35%" cy="30%" r="75%">
                    <stop offset="0%" stopColor="#f4e6b8" />
                    <stop offset="55%" stopColor="#c9a24b" />
                    <stop offset="100%" stopColor="#8f6b1f" />
                  </radialGradient>
                </defs>
                <circle cx="80" cy="80" r="76" fill="none" stroke="#0b5c3d" strokeWidth="2" />
                <circle cx="80" cy="80" r="70" fill="none" stroke="#c9a24b" strokeWidth="1.5" />
                <circle cx="80" cy="80" r="46" fill="url(#sealFace)" stroke="#0b5c3d" strokeWidth="2" />
                <circle cx="80" cy="80" r="40" fill="none" stroke="#fffdf5" strokeWidth="1" opacity="0.6" />
                <text className="cert-seal-curve-text">
                  <textPath href="#sealTextPath" startOffset="0%">
                    ✦ SPEAKUP ✦ OFFICIAL SEAL ✦ VERIFIED ✦
                  </textPath>
                </text>
                <text x="80" y="76" textAnchor="middle" className="cert-seal-center-text">SK</text>
                <text x="80" y="94" textAnchor="middle" className="cert-seal-center-year">EST. 2026</text>
              </svg>
            </div>

            <div className="cert-footer-block">
              <div className="cert-signature-mixed">
                <span className="cert-sig-initials">S</span>
                <svg className="cert-sig-tail" viewBox="0 0 90 50" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4,32 C16,42 28,22 40,34 C50,42 60,26 72,34 C78,38 82,32 86,26"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="cert-sig-initials cert-sig-initials-k">K</span>
                <svg className="cert-sig-tail" viewBox="0 0 90 50" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4,30 C18,40 30,20 44,32 C54,40 64,24 76,32 C82,36 86,30 88,26"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="cert-line" />
              <div className="cert-footer-label">{SIGNER_NAME}</div>
              <div className="cert-footer-caption">{SIGNER_TITLE}</div>
              <div className="cert-footer-caption cert-authorized">Authorized Signatory</div>
            </div>
          </div>

          <div className="cert-footer-verify">
            {verifyUrl && (
              <img
                className="cert-qr"
                crossOrigin="anonymous"
                alt="Scan to verify certificate"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${encodeURIComponent(
                  verifyUrl
                )}`}
              />
            )}
            <div className="cert-id">Certificate ID: {certId}</div>
          </div>
        </div>
      </div>

      <button
        className="tp-send-btn tp-next-btn"
        style={{ marginTop: 24 }}
        onClick={handleDownload}
        disabled={downloading}
      >
        {downloading ? "Preparing PDF…" : "⬇ Download Certificate (PDF)"}
      </button>
    </div>
  );
}