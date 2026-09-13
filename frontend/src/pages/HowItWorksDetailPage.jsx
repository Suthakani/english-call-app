import React from 'react';
import { useNavigate } from 'react-router-dom';
import DpTopBar from './DpTopBar.jsx';
import DpIcon from './DpIcon.jsx';
import '../homepage.css';
import './detailPages.css';

const steps = [
  {
    tag: 'STEP 1',
    title: 'Create your profile in 30 seconds',
    body: 'Sign up with email or Google, tell us your native language, and take a short voice-based level check. No forms, no long onboarding — you can be talking to the AI within a minute of landing on the page.',
    points: ['No credit card required, ever', 'Level check takes about 60 seconds', 'Works straight from your phone browser'],
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    tag: 'STEP 2',
    title: 'Start real conversations, not drills',
    body: 'Pick a category — Speaking, Grammar, Listening, whatever you want to work on — and tap the mic. The AI leads a natural conversation, listens to your replies, and responds the way a person would, adjusting pace and vocabulary to match you.',
    points: ['Choose from six focused learning tracks', 'AI adapts difficulty mid-conversation', 'Practice specific situations: interviews, calls, travel'],
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    tag: 'STEP 3',
    title: 'See exactly how you\u2019re improving',
    body: 'After each session, your fluency score updates, mistakes you made get logged as vocabulary to review, and your streak grows. A weekly report shows the trend, so you know self-study is actually working — not just guessing.',
    points: ['Fluency score after every conversation', 'Weekly report emailed automatically', 'Saved words become personalized flashcards'],
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function HowItWorksDetailPage() {
  const navigate = useNavigate();
  return (
    <div className="detail-page">
      <DpTopBar backLabel="Back to home" />

      <section className="dp-hero">
        <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1800&q=80" alt="" />
        <div className="dp-hero-inner">
          <span className="dp-eyebrow"><DpIcon name="route" size={14} /> HOW IT WORKS</span>
          <h1>Three steps to fluency</h1>
          <p>No complicated setup, no long courses to sit through. SpeakUp is built around one idea: the fastest way to learn to speak is to speak, with a partner who corrects you in the moment.</p>
        </div>
      </section>

      <div className="dp-body">
        {steps.map((s, i) => (
          <div className={`dp-block${i % 2 ? ' dp-block-reverse' : ''}`} key={i}>
            <div className="dp-block-media"><img src={s.image} alt={s.title} /></div>
            <div>
              <div className="dp-block-num">{s.tag}</div>
              <h2>{s.title}</h2>
              <p>{s.body}</p>
              <ul className="dp-list">
                {s.points.map((pt, j) => <li key={j}><span className="dp-dot"></span>{pt}</li>)}
              </ul>
            </div>
          </div>
        ))}

        <div className="dp-stats">
          <div><div className="dp-stat-num">30 sec</div><div className="dp-stat-label">to your first conversation</div></div>
          <div><div className="dp-stat-num">5 min</div><div className="dp-stat-label">average daily practice session</div></div>
          <div><div className="dp-stat-num">0</div><div className="dp-stat-label">textbooks required</div></div>
        </div>
      </div>

      <div className="dp-cta">
        <h2>Ready to talk?</h2>
        <p>Your first conversation is one tap away.</p>
        <button className="dp-btn dp-btn-primary" onClick={() => navigate('/categories')}>
          <DpIcon name="mic" size={16} /> Start learning free
        </button>
      </div>
    </div>
  );
}