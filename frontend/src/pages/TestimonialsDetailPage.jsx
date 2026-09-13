import React from 'react';
import { useNavigate } from 'react-router-dom';
import DpTopBar from './DpTopBar.jsx';
import DpIcon from './DpIcon.jsx';
import '../homepage.css';
import './detailPages.css';

const testimonials = [
  { avatar: 'P', name: 'Priya from Chennai', role: 'Software Engineer', text: 'I was terrified to speak English at work meetings. After 2 weeks on SpeakUp, I led my first presentation in English!', slug: 'speaking', tryLabel: 'Try Speaking practice', image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80' },
  { avatar: 'R', name: 'Raj from Mumbai', role: 'College Student', text: 'The instant correction feature is game-changing. I didn\u2019t even know I was making those grammar mistakes!', slug: 'grammar', tryLabel: 'Try Grammar practice', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80' },
  { avatar: 'M', name: 'Maria from S\u00e3o Paulo', role: 'Marketing Manager', text: 'I tried 5 different apps. SpeakUp is the only one that actually makes me FEEL like I\u2019m having a real conversation.', slug: 'listening', tryLabel: 'Try Listening practice', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80' },
];

export default function TestimonialsDetailPage() {
  const navigate = useNavigate();
  return (
    <div className="detail-page">
      <DpTopBar backLabel="Back to home" />

      <section className="dp-hero" style={{ minHeight: '46vh' }}>
        <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1800&q=80" alt="" />
        <div className="dp-hero-inner">
          <span className="dp-eyebrow"><DpIcon name="heart" size={14} /> REVIEWS</span>
          <h1>Loved by learners worldwide</h1>
          <p>Real stories from real people who transformed their English speaking skills with daily AI conversation practice.</p>
        </div>
      </section>

      <div className="dp-body">
        {testimonials.map((t, i) => (
          <div className={`dp-block${i % 2 ? ' dp-block-reverse' : ''}`} key={i}>
            <div className="dp-block-media"><img src={t.image} alt={t.name} /></div>
            <div>
              <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
                {[1,2,3,4,5].map(s => <DpIcon key={s} name="star" size={16} />)}
              </div>
              <p style={{ fontSize: '1.1rem', color: '#eef6f1' }}>&ldquo;{t.text}&rdquo;</p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '16px 0 20px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(16,185,129,0.18)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ color: 'rgba(238,246,241,0.6)', fontSize: '0.9rem' }}>{t.role}</div>
                </div>
              </div>
              <button className="dp-btn dp-btn-outline" onClick={() => navigate(`/learn/${t.slug}`)}>
                {t.tryLabel} <DpIcon name="arrow-right" size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="dp-cta">
        <h2>Write your own success story</h2>
        <p>Join 50,000+ learners already speaking with confidence.</p>
        <button className="dp-btn dp-btn-primary" onClick={() => navigate('/categories')}>
          <DpIcon name="mic" size={16} /> Start learning free
        </button>
      </div>
    </div>
  );
}