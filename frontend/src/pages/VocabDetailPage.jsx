import React from 'react';
import { useNavigate } from 'react-router-dom';
import DpTopBar from './DpTopBar.jsx';
import DpIcon from './DpIcon.jsx';
import '../homepage.css';
import './detailPages.css';

const words = [
  { word: 'Resilient', meaning: 'able to recover quickly from difficulties', example: 'She stayed resilient even after failing the interview twice.' },
  { word: 'Articulate', meaning: 'able to express ideas clearly and effectively', example: 'He gave an articulate answer during the meeting.' },
  { word: 'Candid', meaning: 'honest and straightforward', example: 'I appreciate your candid feedback on my presentation.' },
  { word: 'Meticulous', meaning: 'showing great attention to detail', example: 'Her meticulous planning made the event a success.' },
  { word: 'Ambitious', meaning: 'having a strong desire for success', example: 'He\u2019s ambitious about growing his career abroad.' },
];

export default function VocabDetailPage() {
  const navigate = useNavigate();
  return (
    <div className="detail-page">
      <DpTopBar backLabel="Back to home" />

      <section className="dp-hero" style={{ minHeight: '46vh' }}>
        <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1800&q=80" alt="" />
        <div className="dp-hero-inner">
          <span className="dp-eyebrow"><DpIcon name="book-open" size={14} /> VOCABULARY BOOST</span>
          <h1>Pick up a new word every time you visit</h1>
          <p>Small daily additions build a powerful vocabulary over time. Every word comes with a plain-English meaning and a real example sentence — save the ones you want to remember.</p>
        </div>
      </section>

      <div className="dp-body">
        <div className="dp-section-head">
          <h2>This week's words</h2>
          <p>Saved words automatically become flashcards in your personal review list.</p>
        </div>

        <div className="dp-grid">
          {words.map((w, i) => (
            <div className="dp-card" key={i}>
              <div className="dp-card-icon"><DpIcon name="book-open" size={20} /></div>
              <h3>{w.word}</h3>
              <p style={{ marginBottom: '10px' }}>{w.meaning}</p>
              <p style={{ fontStyle: 'italic', color: 'rgba(238,246,241,0.5)' }}>&ldquo;{w.example}&rdquo;</p>
            </div>
          ))}
        </div>

        <div className="dp-banner">
          <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1400&q=80" alt="" />
          <div className="dp-banner-inner">
            <h3>Words you save follow you into practice</h3>
            <p>Saved vocabulary resurfaces during your next conversation, so new words don't just sit in a list — you actually get to use them.</p>
          </div>
        </div>
      </div>

      <div className="dp-cta">
        <h2>Start building your vocabulary today</h2>
        <p>Free, unlimited word saving — no account limits.</p>
        <button className="dp-btn dp-btn-primary" onClick={() => navigate('/categories')}>
          <DpIcon name="mic" size={16} /> Start learning free
        </button>
      </div>
    </div>
  );
}