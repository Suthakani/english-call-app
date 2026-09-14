import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DpTopBar from './DpTopBar.jsx';
import DpIcon from './DpIcon.jsx';
import QnASection from './QnASection.jsx';
import '../homepage.css';
import './detailPages.css';

const steps = [
  {
    tag: 'STEP 1',
    icon: 'user',
    title: 'Create your profile in 30 seconds',
    body: 'Sign up with email or Google, tell us your native language, and take a short voice-based level check. No forms, no long onboarding — you can be talking to the AI within a minute of landing on the page.',
    points: ['No credit card required, ever', 'Level check takes about 60 seconds', 'Works straight from your phone browser'],
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    tag: 'STEP 2',
    icon: 'mic',
    title: 'Start real conversations, not drills',
    body: 'Pick a category — Speaking, Grammar, Listening, whatever you want to work on — and tap the mic. The AI leads a natural conversation, listens to your replies, and responds the way a person would, adjusting pace and vocabulary to match you.',
    points: ['Choose from six focused learning tracks', 'AI adapts difficulty mid-conversation', 'Practice specific situations: interviews, calls, travel'],
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    tag: 'STEP 3',
    icon: 'bar-chart-3',
    title: 'See exactly how you\u2019re improving',
    body: 'After each session, your fluency score updates, mistakes you made get logged as vocabulary to review, and your streak grows. A weekly report shows the trend, so you know self-study is actually working — not just guessing.',
    points: ['Fluency score after every conversation', 'Weekly report emailed automatically', 'Saved words become personalized flashcards'],
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80',
  },
];

// Quick highlight cards under the hero — same feature-card language used
// on the Streak and Features detail pages
const highlights = [
  { icon: 'target', title: 'No Guesswork', desc: 'A short level check matches lessons to you from the very first session — no manual level picking.' },
  { icon: 'route', title: 'Six Learning Tracks', desc: 'Speaking, Grammar, Vocabulary, Listening, Pronunciation, and Daily Practice — pick what you need today.' },
  { icon: 'infinity', title: 'Practice Anytime', desc: '24/7 availability means the three steps repeat on your schedule, not a fixed class time.' },
];

const comparisonRows = [
  { feature: 'Time to first conversation', speakup: '30 seconds', traditional: 'Days (enrollment + scheduling)' },
  { feature: 'Setup required', speakup: 'None', traditional: 'Placement test + paperwork' },
  { feature: 'Feedback loop', speakup: 'Instant, every sentence', traditional: 'End of class, if at all' },
  { feature: 'Progress visibility', speakup: 'Live fluency score', traditional: 'Occasional grades' },
];

const howItWorksFaqs = [
  { q: 'Do I need to prepare anything before my first conversation?', a: 'No preparation needed. After the 60-second level check, SpeakUp automatically picks a conversation that matches where you are.' },
  { q: 'What if I don\u2019t know what to say?', a: 'The AI leads — it asks questions, offers prompts, and gives you hints if you go quiet. You\u2019re never left staring at a blank mic.' },
  { q: 'How often should I practice for the three steps to work?', a: 'Even 5 minutes a day is enough to see steady progress. Consistency matters far more than session length.' },
  { q: 'Can I redo the level check later if I improve a lot?', a: 'Yes — you can retake the level check anytime from your profile if you feel your current level no longer fits.' },
];

export default function HowItWorksDetailPage() {
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
        <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1800&q=80" alt="" />
        <div className="dp-hero-inner">
          <span className="dp-eyebrow"><DpIcon name="route" size={14} /> HOW IT WORKS</span>
          <h1>Three steps to fluency</h1>
          <p>No complicated setup, no long courses to sit through. SpeakUp is built around one idea: the fastest way to learn to speak is to speak, with a partner who corrects you in the moment.</p>
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

        {/* ── Three-step alternating blocks ── */}
        {steps.map((s, i) => (
          <div className={`dp-block${i % 2 ? ' dp-block-reverse' : ''} reveal`} key={i}>
            <div className="dp-block-media"><img src={s.image} alt={s.title} loading="lazy" /></div>
            <div>
              <div className="dp-block-num"><DpIcon name={s.icon} size={14} /> &nbsp;{s.tag}</div>
              <h2>{s.title}</h2>
              <p>{s.body}</p>
              <ul className="dp-list">
                {s.points.map((pt, j) => <li key={j}><span className="dp-dot"></span>{pt}</li>)}
              </ul>
            </div>
          </div>
        ))}

        {/* ── Stats row ── */}
        <div className="dp-section-head">
          <span className="dp-eyebrow"><DpIcon name="bar-chart-3" size={14} /> AT A GLANCE</span>
          <h2>What "three steps" actually looks like</h2>
          <p>No textbooks, no long courses — just the numbers that matter.</p>
        </div>
        <div className="dp-stats">
          <div><div className="dp-stat-num dp-shimmer-text">30 sec</div><div className="dp-stat-label">to your first conversation</div></div>
          <div><div className="dp-stat-num dp-shimmer-text">5 min</div><div className="dp-stat-label">average daily practice session</div></div>
          <div><div className="dp-stat-num dp-shimmer-text">0</div><div className="dp-stat-label">textbooks required</div></div>
        </div>

        {/* ── Banner ── */}
        <div className="dp-banner reveal">
          <img src="https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=1400&q=80" alt="" />
          <div className="dp-banner-inner">
            <h3>Speaking first, grammar rules second</h3>
            <p>Traditional classes teach rules before you ever open your mouth. SpeakUp flips that — you speak from minute one, and the corrections teach you the rules as you go.</p>
          </div>
        </div>

        {/* ── Comparison ── */}
        <div className="dp-section-head">
          <span className="dp-eyebrow"><DpIcon name="shield-check" size={14} /> COMPARE</span>
          <h2>Three steps vs. a traditional course</h2>
          <p>What changes when there's no classroom, schedule, or textbook in the way.</p>
        </div>
        <div className="dp-table-wrap">
          <table className="dp-table">
            <thead>
              <tr>
                <th>What matters</th>
                <th className="dp-highlight">SpeakUp</th>
                <th>Traditional course</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={i}>
                  <td>{row.feature}</td>
                  <td className="dp-highlight">{row.speakup}</td>
                  <td>{row.traditional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── FAQ ── */}
        <div className="dp-section-head">
          <span className="dp-eyebrow"><DpIcon name="message-square" size={14} /> FAQ</span>
          <h2>Questions about getting started</h2>
          <p>Everything learners usually ask before their first conversation.</p>
        </div>
        <div className="dp-faq-list">
          {howItWorksFaqs.map((f, i) => (
            <details className="dp-faq-item" key={i}>
              <summary>
                {f.q}
                <DpIcon name="arrow-left" size={16} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <QnASection pageSlug="how-it-works" />
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