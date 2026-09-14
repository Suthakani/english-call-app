
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  speaking: "Speaking",
};

const PERIOD_TYPE_LABELS = { weekly: "Weekly", monthly: "Monthly", yearly: "Yearly" };

// ── Customize these to match your brand ──
const COMPANY_NAME = "SpeakUp";
const COMPANY_TAGLINE = "Learn English Confidently";
const SIGNER_NAME = "SuthaKrish";
const SIGNER_TITLE = "Founder, SpeakUp";

// Builds the two lines of certificate body text based on cert type —
// everything else (border, seal, QR, signature, download) is shared
// across quiz mastery, champion, tournament, event, and hall-of-fame certs.
const buildCertificateCopy = (cert) => {
  if (!cert) return { line1: "", title: "" };
  switch (cert.type) {
    case "champion":
      return { line1: "for being crowned Champion of", title: `Leaderboard Cycle #${(cert.cycleIndex ?? 0) + 1}` };
    case "tournament":
      return { line1: `for placing #${cert.rank} in the`, title: `${PERIOD_TYPE_LABELS[cert.periodType] || ""} Tournament — ${cert.periodKey}` };
    case "event":
      return { line1: `for placing #${cert.rank} in the`, title: `SpeakUp Proficiency Challenge — ${cert.periodKey}` };
    case "hall-of-fame":
      return { line1: "for being crowned SpeakUp Champion of the Year", title: cert.periodKey };
    case "quiz":
    default:
      return { line1: "for successfully completing all 100 levels in", title: CATEGORY_DISPLAY_NAMES[cert.category] || cert.category };
  }
};

const CERT_THEMES = {
  champion:      { accent: "#c9a24b", accentDark: "#b8862f", titleColor: "#0e6b4f" },
  tournament:    { accent: "#4f7fe0", accentDark: "#2b4fb8", titleColor: "#1d3a8f" },
  event:         { accent: "#34c98f", accentDark: "#0e9e6c", titleColor: "#0b5c3d" },
  "hall-of-fame":{ accent: "#a855f7", accentDark: "#7c3aed", titleColor: "#6b21a8" },
  quiz:          { accent: "#c9a24b", accentDark: "#b8862f", titleColor: "#0e6b4f" },
};

const RANK_MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function Certificate() {
  const { certId: rawCertId } = useParams();
  const navigate = useNavigate();
  const certRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const [certData, setCertData] = useState(null); // full verify response
  const [loadingCert, setLoadingCert] = useState(true);
  const [certError, setCertError] = useState("");

  useEffect(() => {
    let active = true;
    setLoadingCert(true);
    setCertError("");
    api
      .get(`/quiz/verify/${rawCertId}`)
      .then(({ data }) => {
        if (active) setCertData(data);
      })
      .catch((err) => {
        if (active) {
          setCertError(err.response?.data?.message || "Certificate not found.");
        }
      })
      .finally(() => {
        if (active) setLoadingCert(false);
      });
    return () => {
      active = false;
    };
  }, [rawCertId]);

  const learnerName = certData?.username || "Learner";
  const { line1, title } = buildCertificateCopy(certData);

  const dateStr = certData?.issuedAt
    ? new Date(certData.issuedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

const certId = certData?.certId || "";
  const theme = CERT_THEMES[certData?.type] || CERT_THEMES.quiz;
  const showMedal = ["tournament", "event"].includes(certData?.type) && RANK_MEDALS[certData?.rank];

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
      pdf.save(`SpeakUp-Certificate-${certId}.pdf`);
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
        <div
          className="cert-border"
          style={{
            "--cert-accent": theme.accent,
            "--cert-accent-dark": theme.accentDark,
            "--cert-title-color": theme.titleColor,
          }}
        >
          {showMedal && <div className="cert-rank-medal">{RANK_MEDALS[certData.rank]}</div>}
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

         
          <p className="cert-body">{line1}</p>
          <h2 className="cert-category">{title}</h2>
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
                  {/* Ink-texture filter: roughens edges + adds uneven pressure
                      spots, like a real self-inking rubber stamp. */}
                  <filter id="stampInk" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" />
                  </filter>
                </defs>
                <g className="cert-seal-stamp" filter="url(#stampInk)">
                  <circle cx="80" cy="80" r="76" fill="none" stroke="#1d3a8f" strokeWidth="3" />
                  <circle cx="80" cy="80" r="69" fill="none" stroke="#1d3a8f" strokeWidth="1.5" />
                  <circle cx="80" cy="80" r="47" fill="none" stroke="#1d3a8f" strokeWidth="2.5" />
                  <text className="cert-seal-curve-text">
                    <textPath href="#sealTextPath" startOffset="0%">
                      ✦ SPEAKUP ✦ OFFICIAL SEAL ✦ VERIFIED ✦
                    </textPath>
                  </text>
                  <text x="80" y="76" textAnchor="middle" className="cert-seal-center-text">SK</text>
                  <text x="80" y="94" textAnchor="middle" className="cert-seal-center-year">EST. 2026</text>
                </g>
              </svg>
            </div>

            <div className="cert-footer-block">

              <svg className="cert-signature-real" viewBox="0 0 260 80" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id="inkTexture" x="-10%" y="-30%" width="120%" height="160%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4" result="n" />
                    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.1" />
                  </filter>
                </defs>
                <text
                  x="130"
                  y="48"
                  textAnchor="middle"
                  filter="url(#inkTexture)"
                  style={{
                    fontFamily: "'Alex Brush', 'Great Vibes', cursive",
                    fontSize: "44px",
                    fill: "#12244f",
                  }}
                >
                  {SIGNER_NAME}
                </text>
                {/* underline flourish */}
                <path
                  d="M20,58 C60,66 100,64 140,60 C180,56 220,58 244,54"
                  fill="none"
                  stroke="#12244f"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  opacity="0.75"
                  filter="url(#inkTexture)"
                />
              </svg>
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