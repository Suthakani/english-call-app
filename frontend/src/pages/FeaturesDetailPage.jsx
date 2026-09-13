import React from 'react';
import { useNavigate } from 'react-router-dom';
import DpTopBar from './DpTopBar.jsx';
import DpIcon from './DpIcon.jsx';
import '../homepage.css';
import './detailPages.css';

const blocks = [
  {
    icon: 'mic',
    tag: 'REAL-TIME VOICE',
    title: 'Conversations that feel like talking to a person',
    body: 'SpeakUp listens as you speak and replies in natural, unscripted English — no menus, no multiple choice. You describe your day, debate an opinion, or roleplay a job interview, and the AI keeps the conversation moving the way a patient native-speaking friend would.',
    points: ['Understands accented and hesitant speech', 'Replies within a second, so the rhythm stays natural', 'Roleplays real situations: interviews, calls, small talk'],
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    icon: 'message-square',
    tag: 'INSTANT CORRECTIONS',
    title: 'Every mistake becomes a lesson, immediately',
    body: 'The moment you finish a sentence, SpeakUp flags the grammar or word-choice slip and shows you the corrected version — while the context is still fresh in your mind, not buried in a report you check later.',
    points: ['Grammar, tense, and preposition corrections inline', 'Pronunciation feedback on tricky sounds', 'Explains the rule in one plain sentence, not jargon'],
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    icon: 'brain',
    tag: 'ADAPTIVE DIFFICULTY',
    title: 'Lessons that grow with you, automatically',
    body: 'Answer confidently and SpeakUp raises the bar — longer sentences, subtler vocabulary, faster pace. Struggle with a topic and it slows down and revisits the basics, so you are always stretched but never stuck.',
    points: ['Difficulty adjusts within the same conversation', 'No manual level selection needed after the first test', 'Revisits weak topics until they are solid'],
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    icon: 'bar-chart-3',
    tag: 'PROGRESS TRACKING',
    title: 'Watch fluency turn into a number you can see grow',
    body: 'Every session updates a fluency score, a streak counter, and a weekly report — vocabulary learned, mistakes fixed, minutes spoken — so improvement is not a feeling, it is a chart trending upward.',
    points: ['Weekly progress report delivered automatically', 'Track speaking minutes, accuracy, and vocabulary growth', 'See exactly which grammar rules you have mastered'],
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function FeaturesDetailPage() {
  const navigate = useNavigate();
  return (
    <div className="detail-page">
      <DpTopBar backLabel="Back to home" />

      <section className="dp-hero">
        <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=80" alt="" />
        <div className="dp-hero-inner">
          <span className="dp-eyebrow"><DpIcon name="sparkles" size={14} /> FEATURES</span>
          <h1>Everything you need to speak fluently</h1>
          <p>SpeakUp isn't a flashcard app — it's an AI conversation partner that listens, corrects, adapts, and tracks your progress in real time, so every minute you spend talking actually moves your English forward.</p>
        </div>
      </section>

      <div className="dp-body">
        {blocks.map((b, i) => (
          <div className={`dp-block${i % 2 ? ' dp-block-reverse' : ''}`} key={i}>
            <div className="dp-block-media"><img src={b.image} alt={b.title} /></div>
            <div>
              <div className="dp-block-num">{b.tag}</div>
              <h2>{b.title}</h2>
              <p>{b.body}</p>
              <ul className="dp-list">
                {b.points.map((pt, j) => <li key={j}><span className="dp-dot"></span>{pt}</li>)}
              </ul>
            </div>
          </div>
        ))}

        <div className="dp-banner">
          <img src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1400&q=80" alt="" />
          <div className="dp-banner-inner">
            <h3>Multi-language support, built for self-learners</h3>
            <p>Get corrections explained in your own native language when you need it, then switch back to full English immersion as you gain confidence — from Tamil, Hindi, and Spanish to 40+ languages.</p>
          </div>
        </div>
      </div>

      <div className="dp-cta">
        <h2>Try it yourself — it takes 30 seconds</h2>
        <p>No credit card, no trial limit. Just tap the mic and start talking.</p>
        <button className="dp-btn dp-btn-primary" onClick={() => navigate('/categories')}>
          <DpIcon name="mic" size={16} /> Start learning free
        </button>
      </div>
    </div>
  );
}