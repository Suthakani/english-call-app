import React from 'react';
import { useNavigate } from 'react-router-dom';
import DpTopBar from './DpTopBar.jsx';
import DpIcon from './DpIcon.jsx';
import '../homepage.css';
import './detailPages.css';

const rows = [
  { feature: 'Cost', speakup: 'Free, forever', traditional: '\u20b95,000+ / month', apps: 'Free with paywalls' },
  { feature: 'Practice availability', speakup: '24/7, anytime', traditional: 'Fixed class schedule', apps: '24/7' },
  { feature: 'Real-time correction', speakup: 'Instant AI feedback', traditional: 'Only during class', apps: 'Limited or delayed' },
  { feature: 'Learns at your pace', speakup: 'Fully personalized', traditional: 'Fixed batch pace', apps: 'Partially adaptive' },
  { feature: 'Native language support', speakup: '40+ languages', traditional: 'Rarely offered', apps: 'Usually 1-2' },
];

export default function ComparisonDetailPage() {
  const navigate = useNavigate();
  return (
    <div className="detail-page">
      <DpTopBar backLabel="Back to home" />

      <section className="dp-hero" style={{ minHeight: '46vh' }}>
        <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1800&q=80" alt="" />
        <div className="dp-hero-inner">
          <span className="dp-eyebrow"><DpIcon name="bar-chart-3" size={14} /> WHY SPEAKUP</span>
          <h1>See how we stack up</h1>
          <p>No coaching fees, no paywalled features. Here's an honest comparison against traditional English classes and other learning apps.</p>
        </div>
      </section>

      <div className="dp-body">
        <div className="dp-table-wrap">
          <table className="dp-table">
            <thead>
              <tr><th>Feature</th><th>SpeakUp</th><th>Traditional Classes</th><th>Other Apps</th></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.feature}</td>
                  <td className="dp-highlight"><DpIcon name="check" size={14} /> {r.speakup}</td>
                  <td>{r.traditional}</td>
                  <td>{r.apps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dp-grid">
          <div className="dp-card">
            <div className="dp-card-icon"><DpIcon name="shield-check" size={22} /></div>
            <h3>Privacy first</h3>
            <p>Your conversations stay private. We never sell your data or show ads.</p>
          </div>
          <div className="dp-card">
            <div className="dp-card-icon"><DpIcon name="graduation-cap" size={22} /></div>
            <h3>Expert-built curriculum</h3>
            <p>Lessons designed with certified English trainers, not just an algorithm.</p>
          </div>
          <div className="dp-card">
            <div className="dp-card-icon"><DpIcon name="users" size={22} /></div>
            <h3>50,000+ learners</h3>
            <p>Trusted by learners across India and dozens of countries worldwide.</p>
          </div>
          <div className="dp-card">
            <div className="dp-card-icon"><DpIcon name="infinity" size={22} /></div>
            <h3>Always free</h3>
            <p>No hidden fees, no premium paywall. Every feature, free forever.</p>
          </div>
        </div>
      </div>

      <div className="dp-cta">
        <h2>Try it and compare for yourself</h2>
        <p>No sign-up commitment — see the difference in your first conversation.</p>
        <button className="dp-btn dp-btn-primary" onClick={() => navigate('/categories')}>
          <DpIcon name="mic" size={16} /> Start learning free
        </button>
      </div>
    </div>
  );
}