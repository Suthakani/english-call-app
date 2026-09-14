import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../homepage.css';
import BottomNav from '../components/BottomNav.jsx';
import Logo from '../components/Logo.jsx';

const learningCategories = [
  { icon: 'mic', title: 'Speaking', desc: 'Practice real-time conversations and build confidence.', level: 'Beginner', slug: 'speaking', image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80' },
  { icon: 'message-square', title: 'Grammar', desc: 'Learn sentence structure with simple examples.', level: 'Intermediate', slug: 'grammar', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80' },
  { icon: 'bar-chart-3', title: 'Vocabulary', desc: 'Improve your daily words with smart revision.', level: 'Advanced', slug: 'vocabulary', image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80' },
  { icon: 'play-circle', title: 'Listening', desc: 'Understand fast English with audio practice.', level: 'Beginner', slug: 'listening', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
  { icon: 'sparkles', title: 'Pronunciation', desc: 'Speak more clearly with guided correction.', level: 'Intermediate', slug: 'pronunciation', image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80' },
  { icon: 'trophy', title: 'Daily Practice', desc: 'Small daily tasks to keep your learning consistent.', level: 'Advanced', slug: 'daily-practice', image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80' },
  // 👇 புதுசா category venum na இங்க add pannunga, same shape la:
  // { icon: 'globe', title: 'Idioms', desc: '...', level: 'Advanced', slug: 'idioms', image: '...' },
];

const Icon = ({ name, size = 22 }) => {
  const paths = {
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
    'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    'bar-chart-3': '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    'play-circle': '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
    sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    'arrow-right': '<line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  };
  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center' }}
      dangerouslySetInnerHTML={{
        __html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`,
      }}
    />
  );
};

export default function AllCategories() {
  const navigate = useNavigate();
  const handleCategoryClick = slug => navigate(`/learn/${slug}`);

  return (
    <div className="homepage-body">
      {/* ── background effects, matching HomePage ── */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <div className="noise"></div>
      <div className="bg-bubbles">
        {[...Array(14)].map((_, i) => (
          <div
            key={`bubble-${i}`}
            className="bg-bubble"
            style={{
              left: `${(i * 7.3) % 100}%`,
              width: `${10 + (i % 5) * 6}px`,
              height: `${10 + (i % 5) * 6}px`,
              animationDuration: `${11 + (i % 6) * 2}s`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="bg-sparkle"
            style={{
              left: `${(i * 8.6) % 100}%`,
              top: `${(i * 13.5) % 100}%`,
              animationDuration: '2.6s',
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="nav-brand" onClick={() => navigate('/')}>
          <div className="nav-brand-icon"><Logo size={40} /></div>
          <span className="brand-wordmark">Speak<span className="brand-accent">Up</span></span>
        </div>
        <button className="back-home-btn" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Home
        </button>
      </nav>

      <section className="section" style={{ paddingTop: '140px' }}>
        <div className="section-header reveal visible">
          <div className="section-tag"><Icon name="sparkles" size={14} /> ALL CATEGORIES</div>
          <h2 className="section-title">Every Way to<br /><span className="gradient-text">Learn English</span></h2>
          <p className="section-desc">Pick any category and start practicing right away.</p>
        </div>

        <div className="learning-grid">
          {learningCategories.map((item, i) => (
            <div
              className="learning-card reveal visible"
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => handleCategoryClick(item.slug)}
              onKeyDown={e => { if (e.key === 'Enter') handleCategoryClick(item.slug); }}
            >
              <div className="learning-card-shine"></div>
              <div className="learning-card-image">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = `https://placehold.co/600x400/0e1f19/10b981?text=${encodeURIComponent(item.title)}`;
                  }}
                />
                <span className="learning-badge learning-badge-overlay">{item.level}</span>
              </div>
              <div className="learning-card-body">
                <div className="learning-icon icon-pulse"><Icon name={item.icon} size={22} /></div>
                <h3 className="learning-title">{item.title}</h3>
                <p className="learning-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}