import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DpTopBar from './DpTopBar.jsx';
import DpIcon from './DpIcon.jsx';
import QnASection from './QnASection.jsx';
import api from '../api/axiosConfig.js';
import { useAuth } from '../context/AuthContext.jsx';
import '../homepage.css';
import './detailPages.css';

// Homepage only rotates 5 easy words. This page goes deeper — real
// advanced vocabulary, grouped by difficulty, each with a plain meaning
// and a natural example sentence.
const wordLevels = [
  {
    level: 'Intermediate',
    icon: 'book-open',
    words: [
      { word: 'Meticulous', meaning: 'showing great attention to detail; extremely careful and precise', example: 'Her meticulous planning made the event a success.' },
      { word: 'Ambitious', meaning: 'having a strong desire for success, power, or achievement', example: 'He\u2019s ambitious about growing his career abroad.' },
      { word: 'Candid', meaning: 'honest and straightforward, even when the truth is uncomfortable', example: 'I appreciate your candid feedback on my presentation.' },
      { word: 'Resilient', meaning: 'able to recover quickly from difficulties or setbacks', example: 'She stayed resilient even after failing the interview twice.' },
    ],
  },
  {
    level: 'Advanced',
    icon: 'sparkles',
    words: [
      { word: 'Ubiquitous', meaning: 'present, appearing, or found everywhere at the same time', example: 'Smartphones have become ubiquitous in modern workplaces.' },
      { word: 'Ambivalent', meaning: 'having mixed or contradictory feelings about something', example: 'I felt ambivalent about accepting the job offer.' },
      { word: 'Pragmatic', meaning: 'dealing with things sensibly and realistically, rather than by theory', example: 'We need a pragmatic solution, not an idealistic one.' },
      { word: 'Eloquent', meaning: 'fluent and persuasive in speaking or writing', example: 'Her eloquent speech convinced the entire board.' },
      { word: 'Discern', meaning: 'to perceive or recognize something that is not obvious', example: 'It was hard to discern his real intentions from the email.' },
      { word: 'Conscientious', meaning: 'wishing to do what is right, especially thorough and careful in one\u2019s work', example: 'He\u2019s a conscientious employee who double-checks everything.' },
    ],
  },
  {
    level: 'Expert',
    icon: 'award',
    words: [
      { word: 'Perspicacious', meaning: 'having a ready insight into and understanding of things', example: 'The perspicacious investor spotted the trend months before anyone else.' },
      { word: 'Ephemeral', meaning: 'lasting for a very short time; fleeting', example: 'Social media trends are often ephemeral, gone within days.' },
      { word: 'Cogent', meaning: 'clear, logical, and convincing', example: 'She made a cogent argument that changed the panel\u2019s decision.' },
      { word: 'Obfuscate', meaning: 'to deliberately make something unclear or difficult to understand', example: 'The report seemed designed to obfuscate the real budget numbers.' },
      { word: 'Sagacious', meaning: 'having or showing keen mental discernment and good judgment', example: 'The sagacious mentor warned him against rushing the deal.' },
    ],
  },
];

const highlights = [
  { icon: 'bookmark', title: 'Save with One Tap', desc: 'Any word you save here becomes a flashcard automatically — no extra typing or organizing.' },
  { icon: 'trophy', title: 'Words Resurface in Practice', desc: 'Saved vocabulary comes back up naturally during your next AI conversation, so it actually sticks.' },
  { icon: 'infinity', title: 'No Saving Limit', desc: 'Save as many words as you want — there\u2019s no cap, no premium tier gating your list.' },
];

const comparisonRows = [
  { feature: 'Words explained in context', speakup: true, others: 'Definition only' },
  { feature: 'Reappears in real conversation', speakup: true, others: 'Rarely' },
  { feature: 'Grouped by difficulty level', speakup: true, others: 'Sometimes' },
  { feature: 'Free unlimited saving', speakup: true, others: 'Often capped' },
];

const vocabFaqs = [
  { q: 'How is the difficulty level of a word decided?', a: 'We group words by how frequently they appear in everyday vs. academic or professional English, and by how many other words you\u2019d typically need to know first to understand them.' },
  { q: 'Do saved words actually appear again in my conversations?', a: 'Yes — the AI weaves recently saved words into upcoming conversations naturally, so you get to practice using them, not just reading their definition.' },
  { q: 'Can I remove a word from my saved list?', a: 'Yes, from your profile\u2019s vocabulary section you can remove any word you no longer want to review.' },
  { q: 'Is there a limit to how many words I can save?', a: 'No. Saving vocabulary is completely free and unlimited on every account.' },
];


export default function VocabDetailPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [savedWords, setSavedWords] = useState([]);
  const [toast, setToast] = useState('');   // 👈 இந்த வரி புதுசா சேருங்க
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

    const handleSaveWord = async (wordObj) => {
    if (!user) {
      navigate('/');
      return;
    }
    try {
      await api.post('/user/vocabulary', {
        word: wordObj.word,
        meaning: wordObj.meaning,
        example: wordObj.example,
      });
      setSavedWords(prev => [...prev, wordObj.word]);
      setToast(`Saved "${wordObj.word}" — check Profile → Learning tab`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast('Could not save word — try again');
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <div className="detail-page">
      <div className="dp-bg-blobs">
        <div className="dp-blob dp-blob-1"></div>
        <div className="dp-blob dp-blob-2"></div>
      </div>
      <div className="dp-noise"></div>

      <DpTopBar backLabel="Back to home" />

      <section className="dp-hero" style={{ minHeight: '52vh' }}>
        <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1800&q=80" alt="" />
        <div className="dp-hero-inner">
          <span className="dp-eyebrow"><DpIcon name="book-open" size={14} /> VOCABULARY BOOST</span>
          <h1>Go beyond the word of the day</h1>
          <p>The homepage gives you one new word each visit — here you get the full library, grouped by difficulty, with plain-English meanings and real example sentences, so you can push as far as you want.</p>
        </div>
      </section>

      <div className="dp-body">

        {/* ── Quick highlights ── */}
        <div className="dp-grid" style={{ marginBottom: 90 }}>
          {highlights.map((h, i) => (
            <div className="dp-card reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="dp-card-icon"><DpIcon name={h.icon} size={22} /></div>
              <h3>{h.title}</h3>
              <p>{h.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Word levels ── */}
        {wordLevels.map((lvl, li) => (
          <div key={li} style={{ marginBottom: 70 }}>
            <div className="dp-section-head" style={{ textAlign: 'left', margin: '0 0 30px' }}>
              <span className="dp-eyebrow"><DpIcon name={lvl.icon} size={14} /> {lvl.level.toUpperCase()}</span>
              <h2 style={{ fontSize: '1.5rem' }}>{lvl.level} vocabulary</h2>
            </div>
            <div className="dp-grid">
              {lvl.words.map((w, i) => {
                const isSaved = savedWords.includes(w.word);
                return (
                  <div className="dp-card reveal" key={i} style={{ transitionDelay: `${(i % 3) * 0.1}s` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div className="dp-card-icon"><DpIcon name="book-open" size={20} /></div>
                      <button
                        onClick={() => handleSaveWord(w)}
                        aria-label="Save word"
                        style={{
                          background: isSaved ? 'var(--dp-accent)' : 'transparent',
                          border: '1px solid rgba(16,185,129,0.3)',
                          borderRadius: 8, padding: 6, cursor: 'pointer',
                          color: isSaved ? '#06120d' : 'var(--dp-accent)',
                        }}
                      >
                        <DpIcon name="bookmark" size={16} />
                      </button>
                    </div>
                    <h3 style={{ marginTop: 14 }}>{w.word}</h3>
                    <p style={{ marginBottom: 10 }}>{w.meaning}</p>
                    <p style={{ fontStyle: 'italic', color: 'rgba(238,246,241,0.5)' }}>&ldquo;{w.example}&rdquo;</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Banner ── */}
        <div className="dp-banner reveal">
          <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1400&q=80" alt="" />
          <div className="dp-banner-inner">
            <h3>Words you save follow you into practice</h3>
            <p>Saved vocabulary resurfaces during your next conversation, so new words don't just sit in a list — you actually get to use them.</p>
          </div>
        </div>

        {/* ── Comparison ── */}
        <div className="dp-section-head">
          <span className="dp-eyebrow"><DpIcon name="shield-check" size={14} /> COMPARE</span>
          <h2>Why context beats a plain word list</h2>
          <p>Most apps stop at a definition. SpeakUp keeps going.</p>
        </div>
        <div className="dp-table-wrap">
          <table className="dp-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th className="dp-highlight">SpeakUp</th>
                <th>Typical word-list apps</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={i}>
                  <td>{row.feature}</td>
                  <td className="dp-highlight">
                    {row.speakup === true ? <DpIcon name="check" size={15} /> : row.speakup}
                  </td>
                  <td>{row.others}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── FAQ ── */}
        <div className="dp-section-head">
          <span className="dp-eyebrow"><DpIcon name="message-square" size={14} /> FAQ</span>
          <h2>Questions about vocabulary building</h2>
          <p>How saving and difficulty levels actually work.</p>
        </div>
        <div className="dp-faq-list">
          {vocabFaqs.map((f, i) => (
            <details className="dp-faq-item" key={i}>
              <summary>
                {f.q}
                <DpIcon name="arrow-left" size={16} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <QnASection pageSlug="vocabulary" />
      </div>

      <div className="dp-cta">
        <h2>Start building your vocabulary today</h2>
        <p>Free, unlimited word saving — no account limits.</p>
        <button className="dp-btn dp-btn-primary" onClick={() => navigate('/categories')}>
          <DpIcon name="mic" size={16} /> Start learning free
        </button>
      </div>

      <div className={`toast${toast ? ' show' : ''}`}>
        <div className="toast-icon"><DpIcon name="check" size={14} /></div>
        <span>{toast}</span>
      </div>
    </div>
  );
}