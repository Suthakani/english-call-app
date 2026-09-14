import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DpTopBar from './DpTopBar.jsx';
import DpIcon from './DpIcon.jsx';
import QnASection from './QnASection.jsx';
import api from '../api/axiosConfig.js';
import { useAuth } from '../context/AuthContext.jsx';
import '../homepage.css';
import './detailPages.css';

const milestones = [
  { icon: 'flame', label: '3-Day Spark', desc: 'Your first small win — enough to prove the habit is starting to stick.' },
  { icon: 'trophy', label: '7-Day Momentum', desc: 'A full week of daily conversation practice, without missing a day.' },
  { icon: 'award', label: '30-Day Streak Master', desc: 'A full month — by this point, speaking English daily feels automatic.' },
  { icon: 'infinity', label: '100-Day Legend', desc: 'Elite consistency. Learners at this streak report the biggest fluency jumps.' },
];

// How streaks actually work — alternating image/text blocks
const howItWorks = [
  {
    num: '01',
    title: 'Practice once a day, that\'s it',
    desc: 'One completed conversation — even a short one — counts toward your streak for the day. No minimum time, no perfect score required.',
    points: ['Any category counts: speaking, grammar, vocabulary, listening', 'Streak updates the moment you finish a session', 'Timezone-aware — your "day" resets at your local midnight'],
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  },
  {
    num: '02',
    title: 'Miss a day, and it resets',
    desc: 'Streaks are meant to build a habit, so missing a full day brings you back to zero. Your longest streak is always saved to your profile, though.',
    points: ['A reminder notification goes out if you haven\'t practiced by evening', 'Your all-time best streak stays on your profile forever', 'Freezes and streak-savers are on our roadmap'],
    image: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=900&q=80',
  },
  {
    num: '03',
    title: 'Milestones unlock as you go',
    desc: 'Every few days of consistency earns you a badge on your profile — a visible marker of how far your habit has come.',
    points: ['Badges are permanent, even if a later streak resets', 'Share milestones with friends to keep each other accountable', 'Longer streaks unlock harder daily challenges'],
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
  },
];

const streakStats = [
  { num: '68%', label: 'of learners who hit a 7-day streak keep going past 30' },
  { num: '3.4×', label: 'faster fluency gains reported by 30-day+ streak holders' },
  { num: '9 min', label: 'average daily session length among streak holders' },
];

const comparisonRows = [
  { feature: 'Daily reminder', streak: true, none: false },
  { feature: 'Progress visible on profile', streak: true, none: false },
  { feature: 'Adaptive difficulty over time', streak: true, none: 'Partial' },
  { feature: 'Badge & milestone rewards', streak: true, none: false },
  { feature: 'Works with just 5 minutes/day', streak: true, none: true },
];

const streakFaqs = [
  { q: 'What time does my streak reset?', a: 'Your streak day is based on your device\'s local timezone and resets at midnight. As long as you complete one session before then, that day counts.' },
  { q: 'Can I pause my streak while on vacation?', a: 'Not yet — streak freezes are on our roadmap. For now, a missed day resets the counter, but your longest-ever streak stays saved on your profile.' },
  { q: 'Does any activity count, or only speaking practice?', a: 'Any completed session counts — speaking, grammar, vocabulary, or listening. We care about daily consistency, not which skill you\'re working on.' },
  { q: 'What happens when I hit a milestone?', a: 'You\'ll get an in-app badge instantly, plus a short recap of your progress so far. Badges stay on your profile permanently, even after a streak resets.' },
];

export default function StreakDetailPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liveStreak, setLiveStreak] = useState(null);
  const [bestStreak, setBestStreak] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get('/user/progress')
      .then(({ data }) => {
        setLiveStreak(data.streakDays);
        setBestStreak(data.longestStreak ?? data.streakDays);
      })
      .catch(() => {});
  }, [user]);

  return (
    <div className="detail-page">
      <div className="dp-bg-blobs">
        <div className="dp-blob dp-blob-1"></div>
        <div className="dp-blob dp-blob-2"></div>
      </div>
      <div className="dp-noise"></div>

      <DpTopBar backLabel="Back to home" />

      <section className="dp-hero" style={{ minHeight: '58vh' }}>
        <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1800&q=80" alt="" />
        <div className="dp-hero-inner">
          <span className="dp-eyebrow"><DpIcon name="flame" size={14} /> STAY CONSISTENT</span>
          <h1>Build your daily<br />speaking streak</h1>
          <p>Every conversation counts. Come back daily, keep your streak alive, and unlock milestones as your consistency grows — because fluency is built by showing up, not by cramming.</p>
        </div>
      </section>

      <div className="dp-body">

        {/* ── Live streak panel ── */}
        <div className="dp-block" style={{ marginBottom: 70 }}>
          <div>
            <div className="dp-block-num">YOUR PROGRESS</div>
            <h2>{user ? 'Here\'s where you stand' : 'Track your own streak'}</h2>
            <p>
              {user
                ? 'Every day you practice adds to this number. Miss a day, and it starts over — so the goal is simple: show up daily.'
                : 'Create a free account and your streak starts counting from your very first conversation.'}
            </p>
            {!user && (
              <button className="dp-btn dp-btn-primary" onClick={() => navigate('/categories')}>
                <DpIcon name="rocket" size={16} /> Start my streak
              </button>
            )}
          </div>
          <div className="dp-block-media" style={{ display: 'flex', gap: 16 }}>
            <div className="dp-card" style={{ flex: 1, textAlign: 'center', padding: '32px 20px' }}>
              <div className="dp-card-icon" style={{ margin: '0 auto 14px' }}><DpIcon name="flame" size={26} /></div>
              <div className="dp-stat-num dp-shimmer-text">{user ? (liveStreak ?? 0) : '—'}</div>
              <div className="dp-stat-label">current streak (days)</div>
            </div>
            <div className="dp-card" style={{ flex: 1, textAlign: 'center', padding: '32px 20px' }}>
              <div className="dp-card-icon" style={{ margin: '0 auto 14px' }}><DpIcon name="award" size={26} /></div>
              <div className="dp-stat-num dp-shimmer-text">{user ? (bestStreak ?? 0) : '—'}</div>
              <div className="dp-stat-label">longest streak ever</div>
            </div>
          </div>
        </div>

        {/* ── Milestones ── */}
        <div className="dp-section-head">
          <span className="dp-eyebrow"><DpIcon name="award" size={14} /> MILESTONES</span>
          <h2>Milestones along the way</h2>
          <p>Each one marks a real, measurable jump in speaking confidence.</p>
        </div>
        <div className="dp-grid">
          {milestones.map((m, i) => (
            <div className="dp-card" key={i}>
              <div className="dp-card-icon"><DpIcon name={m.icon} size={22} /></div>
              <h3>{m.label}</h3>
              <p>{m.desc}</p>
            </div>
          ))}
        </div>

        {/* ── How it works — alternating blocks ── */}
        <div className="dp-section-head">
          <span className="dp-eyebrow"><DpIcon name="target" size={14} /> HOW IT WORKS</span>
          <h2>How the streak actually works</h2>
          <p>No hidden rules — here's exactly what keeps your count going.</p>
        </div>
        {howItWorks.map((step, i) => (
          <div className={`dp-block${i % 2 === 1 ? ' dp-block-reverse' : ''}`} key={i}>
            <div className="dp-block-media">
              <img src={step.image} alt="" loading="lazy" />
            </div>
            <div>
              <div className="dp-block-num">{step.num}</div>
              <h2>{step.title}</h2>
              <p>{step.desc}</p>
              <ul className="dp-list">
                {step.points.map((pt, j) => (
                  <li key={j}><span className="dp-dot"></span>{pt}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        {/* ── Stats row ── */}
        <div className="dp-section-head">
          <span className="dp-eyebrow"><DpIcon name="bar-chart-3" size={14} /> WHY IT WORKS</span>
          <h2>Consistency compounds</h2>
          <p>Illustrative figures based on learner activity patterns.</p>
        </div>
        <div className="dp-stats">
          {streakStats.map((s, i) => (
            <div key={i}>
              <div className="dp-stat-num dp-shimmer-text">{s.num}</div>
              <div className="dp-stat-label" style={{ maxWidth: 220 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Banner ── */}
        <div className="dp-banner">
          <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80" alt="" />
          <div className="dp-banner-inner">
            <h3>Five minutes a day beats one hour a week</h3>
            <p>Short, daily conversations build muscle memory for speaking. Your streak is a simple, visible reminder to keep that rhythm going.</p>
          </div>
        </div>

        {/* ── Streak vs no streak comparison ── */}
        <div className="dp-section-head">
          <span className="dp-eyebrow"><DpIcon name="shield-check" size={14} /> COMPARE</span>
          <h2>With a streak vs. without</h2>
          <p>What changes once you start tracking daily practice.</p>
        </div>
        <div className="dp-table-wrap">
          <table className="dp-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="dp-highlight">With streak</th>
                <th>Without</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={i}>
                  <td>{row.feature}</td>
                  <td className="dp-highlight">
                    {row.streak === true ? <DpIcon name="check" size={15} /> : row.streak}
                  </td>
                  <td>{row.none === true ? <DpIcon name="check" size={15} /> : (row.none || '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── FAQ ── */}
        <div className="dp-section-head">
          <span className="dp-eyebrow"><DpIcon name="mic" size={14} /> FAQ</span>
          <h2>Streak questions, answered</h2>
          <p>The most common things learners ask us about streaks.</p>
        </div>
        <div className="dp-faq-list">
          {streakFaqs.map((f, i) => (
            <details className="dp-faq-item" key={i}>
              <summary>
                {f.q}
                <DpIcon name="arrow-left" size={16} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        {/* Users can ask about the streak feature here; admin replies show
            up tagged "Official Answer", other learners can also chime in. */}
        <QnASection pageSlug="streak" />
      </div>

      <div className="dp-cta">
        <h2>Start your streak today</h2>
        <p>One conversation is all it takes to begin.</p>
        <button className="dp-btn dp-btn-primary" onClick={() => navigate('/categories')}>
          <DpIcon name="mic" size={16} /> Start learning free
        </button>
      </div>
    </div>
  );
}