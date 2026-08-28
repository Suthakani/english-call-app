import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Heading ku etha content — ungal category list oda match aaganum
const CATEGORY_INFO = {
  speaking:  { title: "Speaking",  desc: "Practice real-time conversations and build confidence.", topics: ["Everyday phrases", "Fluency", "Confidence building"] },
  grammar:   { title: "Grammar",   desc: "Learn sentence structure with simple examples.", topics: ["Tenses", "Sentence structure", "Common mistakes"] },
  vocabulary:{ title: "Vocabulary",desc: "Improve your daily words with smart revision.", topics: ["Daily words", "Synonyms", "Word usage"] },
  listening: { title: "Listening", desc: "Understand fast English with audio practice.", topics: ["Audio comprehension", "Accents", "Context clues"] },
  pronunciation: { title: "Pronunciation", desc: "Speak more clearly with guided correction.", topics: ["Sounds", "Stress & intonation", "Clarity"] },
  "daily-practice": { title: "Daily Practice", desc: "Small daily tasks to keep your learning consistent.", topics: ["Mixed practice", "Quick drills", "Consistency"] },
};

const LEVEL_LABELS = { basic: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

export default function CategoryDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const info = CATEGORY_INFO[slug] || { title: slug, desc: "", topics: [] };
  const level = user?.level || "basic";

  return (
    <div className="catdetail-page">
      <div className="catdetail-inner">
        <button className="catdetail-back" onClick={() => navigate(-1)}>← Back</button>

        <h1 className="catdetail-h1">{info.title}</h1>
        <p className="catdetail-level">
          Your level: <strong>{LEVEL_LABELS[level] || level}</strong>
        </p>
        <p className="catdetail-desc">{info.desc}</p>

        <div className="catdetail-topics">
          {info.topics.map((t, i) => (
            <span className="catdetail-chip" key={i}>{t}</span>
          ))}
        </div>

        <div className="catdetail-modes">
          <button className="catdetail-mode-btn" onClick={() => navigate(`/text/${slug}`)}>
            ⌨️ Practice by Typing
          </button>
          <button className="catdetail-mode-btn catdetail-mode-btn-primary" onClick={() => navigate(`/call/${slug}`)}>
            🎤 Practice by Speaking
          </button>
        </div>
      </div>
    </div>
  );
}