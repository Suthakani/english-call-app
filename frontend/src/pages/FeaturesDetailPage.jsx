import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DpTopBar from './DpTopBar.jsx';
import DpIcon from './DpIcon.jsx';
import QnASection from './QnASection.jsx';
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

// Quick highlight cards — same feature-card language used elsewhere
const highlights = [
  { icon: 'globe', title: '40+ Languages', desc: 'Get corrections explained in your own native language, then switch to full English immersion.' },
  { icon: 'shield-check', title: 'Private by Design', desc: 'Conversations are never sold or used for advertising — only to personalize your own lessons.' },
  { icon: 'infinity', title: 'No Paywalls', desc: 'Every feature on this page is free forever — no premium tier hiding the good parts.' },
];

const comparisonRows = [
  { feature: 'Responds in real time', speakup: true, others: 'Delayed / scripted' },
  { feature: 'Corrects mid-conversation', speakup: true, others: 'End-of-lesson only' },
  { feature: 'Adjusts difficulty live', speakup: true, others: 'Fixed levels' },
  { feature: 'Explains mistakes in your language', speakup: true, others: 'Rarely available' },
  { feature: 'Weekly progress report', speakup: true, others: 'Basic or none' },
];

const featureFaqs = [
  { q: 'Does the AI actually understand accented English?', a: 'Yes — SpeakUp is trained on a wide range of accents and hesitant, non-native speech patterns, so it responds naturally even if your pronunciation isn\'t perfect yet.' },
  { q: 'How fast are the corrections?', a: 'Corrections appear right after you finish speaking — usually within a second or two — so the mistake and the fix stay connected in your memory.' },
  { q: 'Can I turn off native-language explanations later?', a: 'Yes. Many learners start with explanations in their native language and gradually switch to full English-only mode as their confidence grows.' },
  { q: 'Is the progress report only visible to me?', a: 'Yes — your fluency score, streak, and weekly report are private to your account and are never shared or sold.' },
];

export default function FeaturesDetailPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="detail-page">
      <div className="dp-bg-blobs">
        <div className="dp-blob dp-blob-1"></div>
        <div className="dp-blob dp-blob-2"></div>
      </div>
      <div className="dp-noise"></div>

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

        {/* ── Deep-dive alternating blocks ── */}
        {blocks.map((b, i) => (
          <div className={`dp-block${i % 2 ? ' dp-block-reverse' : ''} reveal`} key={i}>
            <div className="dp-block-media"><img src={b.image} alt={b.title} loading="lazy" /></div>
            <div>
              <div className="dp-block-num"><DpIcon name={b.icon} size={14} /> &nbsp;{b.tag}</div>
              <h2>{b.title}</h2>
              <p>{b.body}</p>
              <ul className="dp-list">
                {b.points.map((pt, j) => <li key={j}><span className="dp-dot"></span>{pt}</li>)}
              </ul>
            </div>
          </div>
        ))}

        {/* ── Banner ── */}
        <div className="dp-banner reveal">
          <img src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1400&q=80" alt="" />
          <div className="dp-banner-inner">
            <h3>Multi-language support, built for self-learners</h3>
            <p>Get corrections explained in your own native language when you need it, then switch back to full English immersion as you gain confidence — from Tamil, Hindi, and Spanish to 40+ languages.</p>
          </div>
        </div>

        {/* ── Comparison ── */}
        <div className="dp-section-head">
          <span className="dp-eyebrow"><DpIcon name="bar-chart-3" size={14} /> WHY IT'S DIFFERENT</span>
          <h2>SpeakUp vs. typical language apps</h2>
          <p>Not every app that says "AI-powered" actually reacts to you in real time.</p>
        </div>
        <div className="dp-table-wrap">
          <table className="dp-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th className="dp-highlight">SpeakUp</th>
                <th>Most other apps</th>
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
          <h2>Common questions about these features</h2>
          <p>Still curious how something works? Here's the short version.</p>
        </div>
        <div className="dp-faq-list">
          {featureFaqs.map((f, i) => (
            <details className="dp-faq-item" key={i}>
              <summary>
                {f.q}
                <DpIcon name="arrow-left" size={16} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <QnASection pageSlug="features" />
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