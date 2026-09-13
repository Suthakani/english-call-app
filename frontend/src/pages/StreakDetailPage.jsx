import React from 'react';
import { useNavigate } from 'react-router-dom';
import DpTopBar from './DpTopBar.jsx';
import DpIcon from './DpIcon.jsx';
import QnASection from './QnASection.jsx';
import '../homepage.css';
import './detailPages.css';

const milestones = [
  { icon: 'flame', label: '3-Day Spark', desc: 'Your first small win — enough to prove the habit is starting to stick.' },
  { icon: 'trophy', label: '7-Day Momentum', desc: 'A full week of daily conversation practice, without missing a day.' },
  { icon: 'award', label: '30-Day Streak Master', desc: 'A full month — by this point, speaking English daily feels automatic.' },
  { icon: 'infinity', label: '100-Day Legend', desc: 'Elite consistency. Learners at this streak report the biggest fluency jumps.' },
];

export default function StreakDetailPage() {
  const navigate = useNavigate();
  return (
    <div className="detail-page">
      <DpTopBar backLabel="Back to home" />

      <section className="dp-hero" style={{ minHeight: '46vh' }}>
        <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1800&q=80" alt="" />
        <div className="dp-hero-inner">
          <span className="dp-eyebrow"><DpIcon name="flame" size={14} /> STAY CONSISTENT</span>
          <h1>Build your daily speaking streak</h1>
          <p>Every conversation counts. Come back daily, keep your streak alive, and unlock milestones as your consistency grows — because fluency is built by showing up, not by cramming.</p>
        </div>
      </section>

      <div className="dp-body">
        <div className="dp-section-head">
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

        <div className="dp-banner">
          <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80" alt="" />
          <div className="dp-banner-inner">
            <h3>Five minutes a day beats one hour a week</h3>
            <p>Short, daily conversations build muscle memory for speaking. Your streak is a simple, visible reminder to keep that rhythm going.</p>
          </div>
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