import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";
import { useAuth } from "../context/AuthContext.jsx";
import BottomNav from '../components/BottomNav.jsx';

// Categories are different for each tested level. Each one now also carries:
//  - image: a real photo so the card isn't just an emoji + text
//  - topics: the specific things practiced inside this category (vocabulary,
//    speaking, grammar, etc.) so it's clear what "learning" actually means
//    before clicking in.
const CATEGORIES_BY_LEVEL = {
  basic: [
    {
      key: "greetings",
      title: "Greetings & Introductions",
      icon: "👋",
      image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Everyday phrases"],
    },
    {
      key: "daily-routine",
      title: "Daily Routine",
      icon: "☀️",
      image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Present tense", "Vocabulary"],
    },
    {
      key: "family-friends",
      title: "Family & Friends",
      icon: "👨‍👩‍👧",
      image: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Descriptions"],
    },
    {
      key: "simple-shopping",
      title: "Simple Shopping",
      icon: "🛒",
      image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Numbers & prices", "Vocabulary"],
    },
    {
      key: "directions",
      title: "Asking Directions",
      icon: "🧭",
      image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Prepositions", "Vocabulary"],
    },
    {
      key: "weather-time",
      title: "Weather & Time",
      icon: "🌦️",
      image: "https://images.unsplash.com/photo-1601134467661-3d775b999c8b?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Small talk"],
    },
    {
      key: "hobbies",
      title: "Hobbies & Free Time",
      icon: "🎨",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Descriptions"],
    },
    {
      key: "health-basic",
      title: "At the Doctor",
      icon: "🩺",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Describing symptoms"],
    },
    {
      key: "numbers-counting",
      title: "Numbers & Counting",
      icon: "🔢",
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Numbers & prices", "Vocabulary"],
    },
    {
      key: "clothing-appearance",
      title: "Clothing & Appearance",
      icon: "👕",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Descriptions"],
    },
    {
      key: "school-learning",
      title: "School & Learning",
      icon: "📚",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Everyday phrases"],
    },
    {
      key: "emotions-feelings",
      title: "Emotions & Feelings",
      icon: "🙂",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Descriptions"],
    },
  ],
  intermediate: [
    {
      key: "interview",
      title: "Job Interview",
      icon: "💼",
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Formal grammar", "Professional vocabulary"],
    },
    {
      key: "travel",
      title: "Travel & Airport",
      icon: "✈️",
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Polite requests"],
    },
    {
      key: "food",
      title: "Restaurant & Food",
      icon: "🍽️",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Ordering phrases"],
    },
    {
      key: "daily",
      title: "Daily Conversation",
      icon: "💬",
      image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Listening", "Natural expressions"],
    },
    {
      key: "phone",
      title: "Phone Calls",
      icon: "📞",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Listening", "Formal phrases"],
    },
    {
      key: "shopping-bargain",
      title: "Shopping & Bargaining",
      icon: "🛍️",
      image: "https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Negotiation phrases", "Vocabulary"],
    },
    {
      key: "healthcare",
      title: "Hospital & Health",
      icon: "🏥",
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Formal requests"],
    },
    {
      key: "technology",
      title: "Technology & Gadgets",
      icon: "💻",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Explaining problems"],
    },
    {
      key: "emergency",
      title: "Emergency Situations",
      icon: "🚨",
      image: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Urgent phrases", "Vocabulary"],
    },
    {
      key: "banking-money",
      title: "Banking & Money",
      icon: "🏦",
      image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Formal requests"],
    },
    {
      key: "housing-rent",
      title: "Housing & Rent",
      icon: "🏠",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Polite requests"],
    },
    {
      key: "social-media",
      title: "Social Media",
      icon: "📱",
      image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Listening", "Natural expressions"],
    },
    {
      key: "sports-fitness",
      title: "Sports & Fitness",
      icon: "🏋️",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Vocabulary", "Descriptions"],
    },
  ],
  advanced: [
    {
      key: "business",
      title: "Business Meeting",
      icon: "📊",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Advanced grammar", "Business vocabulary"],
    },
    {
      key: "debate",
      title: "Debates & Opinions",
      icon: "🗣️",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Argument structure", "Persuasive language"],
    },
    {
      key: "idioms",
      title: "Idioms & Slang",
      icon: "🎭",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80",
      topics: ["Vocabulary", "Speaking", "Cultural expressions"],
    },
    {
      key: "negotiation",
      title: "Negotiation",
      icon: "🤝",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Persuasive grammar", "Vocabulary"],
    },
    {
      key: "news",
      title: "News Discussion",
      icon: "📰",
      image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=600&q=80",
      topics: ["Listening", "Speaking", "Current-affairs vocabulary"],
    },
    {
      key: "academic",
      title: "Academic Discussion",
      icon: "🎓",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Formal grammar", "Analytical vocabulary"],
    },
    {
      key: "environment",
      title: "Environment & Climate",
      icon: "🌍",
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Listening", "Topic-specific vocabulary"],
    },
    {
      key: "legal",
      title: "Legal & Formal Matters",
      icon: "⚖️",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Formal grammar", "Legal vocabulary"],
    },
    {
      key: "politics-government",
      title: "Politics & Government",
      icon: "🏛️",
      image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Listening", "Current-affairs vocabulary"],
    },
    {
      key: "science-innovation",
      title: "Science & Innovation",
      icon: "🔬",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Analytical vocabulary", "Formal grammar"],
    },
    {
      key: "art-culture",
      title: "Art & Culture",
      icon: "🖼️",
      image: "https://images.unsplash.com/photo-1499426600726-7f0a70f7db8b?auto=format&fit=crop&w=600&q=80",
      topics: ["Vocabulary", "Speaking", "Cultural expressions"],
    },
    {
      key: "career-development",
      title: "Career Development",
      icon: "📈",
      image: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80",
      topics: ["Speaking", "Business vocabulary", "Advanced grammar"],
    },
  ],
};

const LEVEL_LABELS = { basic: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

export default function CategorySelect() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTopics, setActiveTopics] = useState([]); // multi-select filter chips

  const level = user?.level || "basic";
  const allCategories = CATEGORIES_BY_LEVEL[level] || CATEGORIES_BY_LEVEL.basic;
  const showTextOption = level === "basic";

  // All unique topic tags available for this level, used to render filter chips.
  const allTopics = useMemo(() => {
    const set = new Set();
    allCategories.forEach((c) => c.topics.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [allCategories]);

  const toggleTopic = (topic) => {
    setActiveTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  // Filters by the search box (title or topic match) AND by any active filter chips
  // (a category must contain every selected topic tag).
  const categories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allCategories.filter((c) => {
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.topics.some((t) => t.toLowerCase().includes(q));
      const matchesTopics =
        activeTopics.length === 0 || activeTopics.every((t) => c.topics.includes(t));
      return matchesSearch && matchesTopics;
    });
  }, [allCategories, searchQuery, activeTopics]);

  const clearAll = () => {
    setSearchQuery("");
    setActiveTopics([]);
  };

  const startPractice = async (key, mode) => {
    try {
      await api.post("/test/set-categories", { categories: [key] });
    } catch (err) {
      console.error("Could not save preferred category (continuing anyway):", err);
    }
    if (user) localStorage.setItem('lastCategorySlug', key);
    navigate(mode === "text" ? `/text/${key}` : `/call/${key}`);
  };

  return (
    <div className="cat-page">
      <div className="cat-shell">
        {/* ── Left sidebar: search + filters ── */}
        <aside className="cat-sidebar">
          <button className="cat-home-btn" onClick={() => navigate('/')}>← Home</button>

          <div className="cat-sidebar-heading">
            <h2>Find a topic</h2>
            <p>Search or filter categories to practice</p>
          </div>

          <div className="cat-search-box">
            <span className="cat-search-icon">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search e.g. travel, food..."
              className="cat-search-input"
            />
            {searchQuery && (
              <button
                className="cat-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="cat-filters">
            <div className="cat-filters-heading">
              <span>Filter by focus</span>
              {activeTopics.length > 0 && (
                <button className="cat-filters-reset" onClick={() => setActiveTopics([])}>
                  Reset
                </button>
              )}
            </div>
            <div className="cat-filters-chips">
              {allTopics.map((topic) => (
                <button
                  key={topic}
                  className={`cat-filter-chip${activeTopics.includes(topic) ? " cat-filter-chip-active" : ""}`}
                  onClick={() => toggleTopic(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <p className="cat-sidebar-count">
            {categories.length} of {allCategories.length} topics
          </p>
        </aside>

        {/* ── Main content ── */}
        <div className="cat-main">
          <h1 className="cat-h1">Hey {user?.username} 👋</h1>
          <p className="cat-subtitle">
            Your level: <strong className="cat-level-highlight">{LEVEL_LABELS[level] || level.toUpperCase()}</strong> — pick a topic below.
            Each one covers real speaking practice plus the vocabulary and grammar that go with it.
          </p>

          {categories.length === 0 ? (
            <div className="cat-empty-state">
              <span className="cat-empty-icon">🔍</span>
              <p>No topics match your search / filters</p>
              <button className="cat-mode-btn" onClick={clearAll}>
                Clear search & filters
              </button>
            </div>
          ) : (
            <div className="cat-grid">
              {categories.map((c) => (
                <div key={c.key} className="cat-card">
                  <div className="cat-card-image">
                    <img src={c.image} alt={c.title} loading="lazy" />
                    <span className="cat-card-icon-badge">{c.icon}</span>
                  </div>
                  <div className="cat-card-body">
                    <h3 className="cat-card-title">{c.title}</h3>
                    <div className="cat-card-topics">
                      {c.topics.map((t, i) => (
                        <span className="cat-topic-chip" key={i}>{t}</span>
                      ))}
                    </div>
                    {showTextOption ? (
                      <div className="cat-modes-row">
                        <button className="cat-mode-btn" onClick={() => startPractice(c.key, "text")}>
                          ⌨️ Type
                        </button>
                        <button className="cat-mode-btn cat-mode-btn-primary" onClick={() => startPractice(c.key, "call")}>
                          🎤 Speak
                        </button>
                      </div>
                    ) : (
                      <button className="cat-mode-btn-full" onClick={() => startPractice(c.key, "call")}>
                        🎤 Start Learning
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .cat-page {
          position: fixed; inset: 0; overflow-y: auto; z-index: 1;
          width: 100vw; min-height: 100vh; box-sizing: border-box;
          font-family: 'Inter', system-ui, sans-serif;
          background: linear-gradient(135deg, #050a08, #0e1f19, #070d0a);
          color: #ffffff;
        }
        .cat-shell {
          display: flex;
          align-items: flex-start;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          gap: 32px;
          padding: 32px 40px 80px;
          box-sizing: border-box;
        }

        /* ── Sidebar ── */
        .cat-sidebar {
          flex: 0 0 260px;
          position: sticky;
          top: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .cat-home-btn {
          align-self: flex-start;
          padding: 9px 16px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.12);
          color: #fff; font-weight: 600; font-size: 14px;
          cursor: pointer; transition: all 0.25s; font-family: inherit;
        }
        .cat-home-btn:hover { border-color: #10b981; background: rgba(16,185,129,0.1); }

        .cat-sidebar-heading h2 {
          font-size: 18px; font-weight: 800; margin: 0 0 4px;
        }
        .cat-sidebar-heading p {
          font-size: 13px; color: rgba(255,255,255,0.5); margin: 0;
        }

        .cat-search-box {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 0 12px;
          transition: border-color 0.25s;
        }
        .cat-search-box:focus-within {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.15);
        }
        .cat-search-icon { font-size: 14px; opacity: 0.6; margin-right: 8px; }
        .cat-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 14px;
          font-family: inherit;
          padding: 11px 0;
        }
        .cat-search-input::placeholder { color: rgba(255,255,255,0.35); }
        .cat-search-clear {
          background: none; border: none; color: rgba(255,255,255,0.5);
          cursor: pointer; font-size: 13px; padding: 4px;
        }
        .cat-search-clear:hover { color: #fff; }

        /* ── Filters ── */
        .cat-filters {
          display: flex; flex-direction: column; gap: 10px;
          padding-top: 4px;
        }
        .cat-filters-heading {
          display: flex; align-items: center; justify-content: space-between;
          font-size: 12.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.04em; color: rgba(255,255,255,0.45);
        }
        .cat-filters-reset {
          background: none; border: none; cursor: pointer;
          font-size: 12px; font-weight: 600; color: #10b981;
          text-transform: none; letter-spacing: normal;
        }
        .cat-filters-reset:hover { color: #34d399; }
        .cat-filters-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .cat-filter-chip {
          font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 999px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.75); cursor: pointer; transition: all 0.2s;
          font-family: inherit;
        }
        .cat-filter-chip:hover { border-color: rgba(16,185,129,0.4); color: #fff; }
        .cat-filter-chip-active {
          background: rgba(16,185,129,0.18); border-color: #10b981; color: #d4af37;
        }

        .cat-sidebar-count {
          font-size: 12.5px; color: rgba(255,255,255,0.4); margin: 0;
        }

        /* ── Main content ── */
        .cat-main { flex: 1; min-width: 0; }
        .cat-h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 8px; }
        .cat-subtitle {
          color: rgba(255,255,255,0.62); font-size: 15px; margin: 0 0 40px;
          max-width: 620px; line-height: 1.6;
        }
        .cat-level-highlight {
          background: linear-gradient(135deg, #10b981, #d4af37);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .cat-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }

        .cat-empty-state {
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          padding: 80px 20px; text-align: center;
          color: rgba(255,255,255,0.55);
        }
        .cat-empty-icon { font-size: 34px; opacity: 0.6; }

        .cat-card {
          border-radius: 20px; overflow: hidden;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          backdrop-filter: blur(18px);
          transition: all 0.3s;
        }
        .cat-card:hover {
          transform: translateY(-6px);
          border-color: rgba(16,185,129,0.4);
          box-shadow: 0 20px 50px rgba(0,0,0,0.35);
        }
        .cat-card-image { position: relative; width: 100%; height: 140px; overflow: hidden; }
        .cat-card-image img {
          width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;
        }
        .cat-card:hover .cat-card-image img { transform: scale(1.08); }
        .cat-card-image::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(5,10,8,0.85) 100%);
        }
        .cat-card-icon-badge {
          position: absolute; bottom: 10px; left: 14px; z-index: 2;
          font-size: 26px;
        }
        .cat-card-body { padding: 18px 20px 22px; }
        .cat-card-title { font-weight: 700; font-size: 17px; color: #fff; margin-bottom: 10px; }
        .cat-card-topics { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .cat-topic-chip {
          font-size: 11.5px; font-weight: 600; padding: 4px 10px; border-radius: 999px;
          background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25);
          color: #f0d98a;
        }
        .cat-modes-row { display: flex; gap: 8px; }
        .cat-mode-btn {
          flex: 1; padding: 10px 8px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: #fff; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .cat-mode-btn:hover { background: rgba(255,255,255,0.1); }
        .cat-mode-btn-primary {
          border: none;
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 6px 18px rgba(16,185,129,0.28);
        }
        .cat-mode-btn-primary:hover { transform: translateY(-2px); }
        .cat-mode-btn-full {
          width: 100%; padding: 11px 8px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; font-size: 13.5px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 6px 18px rgba(16,185,129,0.28);
          transition: all 0.2s;
        }
        .cat-mode-btn-full:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(16,185,129,0.4); }

        @media (max-width: 900px) {
          .cat-shell { flex-direction: column; padding: 24px 16px 60px; }
          .cat-sidebar { position: static; flex: none; width: 100%; }
        }
        @media (max-width: 600px) {
          .cat-h1 { font-size: 26px; }
          .cat-page { padding-bottom: 76px; }
        }
      `}</style>

      <BottomNav />
    </div>
  );
}