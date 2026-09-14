import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DpTopBar from './DpTopBar.jsx';
import DpIcon from './DpIcon.jsx';
import QnASection from './QnASection.jsx';
import '../homepage.css';
import './detailPages.css';

const rows = [
  { feature: 'Cost', speakup: 'Free, forever', traditional: '\u20b95,000+ / month', apps: 'Free with paywalls' },
  { feature: 'Practice availability', speakup: '24/7, anytime', traditional: 'Fixed class schedule', apps: '24/7' },
  { feature: 'Real-time correction', speakup: 'Instant AI feedback', traditional: 'Only during class', apps: 'Limited or delayed' },
  { feature: 'Learns at your pace', speakup: 'Fully personalized', traditional: 'Fixed batch pace', apps: 'Partially adaptive' },
  { feature: 'Native language support', speakup: '40+ languages', traditional: 'Rarely offered', apps: 'Usually 1-2' },
];

const highlights = [
  { icon: 'shield-check', title: 'Privacy First', desc: 'Your conversations stay private. We never sell your data or show ads.' },
  { icon: 'graduation-cap', title: 'Expert-Built Curriculum', desc: 'Lessons designed with certified English trainers, not just an algorithm.' },
  { icon: 'users', title: '50,000+ Learners', desc: 'Trusted by learners across India and dozens of countries worldwide.' },
  { icon: 'infinity', title: 'Always Free', desc: 'No hidden fees, no premium paywall. Every feature, free forever.' },
];

// Deeper cost breakdown — what a traditional class or a paywalled app
// actually costs you over a year, vs. SpeakUp
const costBlocks = [
  {
    tag: '01 · MONEY',
    icon: 'bar-chart-3',
    title: 'A year of traditional classes can cost more than a laptop',
    body: 'Group English classes in most cities run \u20b95,000–\u20b912,000 a month. Over a year, that\u2019s \u20b960,000–\u20b91,40,000 — often for a fixed 2-hour weekly slot you have to physically attend. SpeakUp gives you the same (often better) daily practice for \u20b90.',
    points: ['No enrollment fee, no monthly fee, no hidden add-ons', 'No cost difference between beginner and advanced levels', 'Every feature on this page is included, not upsold later'],
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    tag: '02 · TIME',
    icon: 'target',
    title: 'Waiting for a class slot vs. talking right now',
    body: 'A traditional class means waiting for the next scheduled session — sometimes days away. Most "AI-powered" apps still gate real conversation practice behind lesson trees. SpeakUp starts the actual conversation the moment you tap the mic.',
    points: ['No enrollment queue or batch start dates', 'Practice at 6 AM or midnight — availability never changes', 'No mandatory lesson sequence before you can just talk'],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    tag: '03 · DEPTH',
    icon: 'brain',
    title: 'One AI partner vs. a fixed classroom pace',
    body: 'A class moves at the average pace of the whole group — too slow for some, too fast for others. Other apps often adapt within narrow pre-set levels. SpeakUp adjusts vocabulary and sentence complexity within the same conversation, matching you specifically.',
    points: ['Difficulty shifts sentence-by-sentence, not level-by-level', 'No waiting for slower classmates or repeating what you already know', 'Corrections are about your mistake, not a generic worksheet'],
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
  },
];

const extendedComparisonRows = [
  { feature: 'Setup / enrollment time', speakup: '30 seconds', traditional: 'Days to weeks', apps: 'Minutes' },
  { feature: 'Feedback delay', speakup: 'Instant', traditional: 'End of class or never', apps: 'Often delayed' },
  { feature: 'Cancel anytime, no fee', speakup: true, traditional: false, apps: 'Sometimes' },
  { feature: 'Works on any device', speakup: true, traditional: false, apps: true },
];

const comparisonFaqs = [
  { q: 'Is SpeakUp really free forever, not just a free trial?', a: 'Yes — every feature shown across this site, including voice conversations and progress tracking, is free permanently. There is no trial period that expires.' },
  { q: 'How does SpeakUp make money if it\u2019s free?', a: 'We keep the product lean and focus on building a large, engaged learner base first. There are no ads and no plans to sell user data — monetization, if it ever happens, will not compromise the free core experience.' },
  { q: 'Can a free AI app really replace a human tutor?', a: 'For daily speaking practice and instant correction, yes — that\u2019s exactly what real-time AI is well-suited for. Many learners pair SpeakUp\u2019s daily practice with occasional human tutoring for deeper feedback.' },
  { q: 'What\u2019s the catch with "free with paywalls" apps?', a: 'Typically the free tier limits daily conversation minutes, locks advanced levels, or shows ads — the core "talk to an AI" experience is often the first thing gated behind a subscription.' },
];

export default function ComparisonDetailPage() {
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

      <section className="dp-hero" style={{ minHeight: '52vh' }}>
        <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=1800&q=80" alt="" />
        <div className="dp-hero-inner">
          <span className="dp-eyebrow"><DpIcon name="bar-chart-3" size={14} /> WHY SPEAKUP</span>
          <h1>See how we stack up</h1>
          <p>No coaching fees, no paywalled features. Here's an honest comparison against traditional English classes and other learning apps.</p>
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

        {/* ── Primary comparison table ── */}
        <div className="dp-section-head">
          <span className="dp-eyebrow"><DpIcon name="shield-check" size={14} /> AT A GLANCE</span>
          <h2>The headline numbers</h2>
          <p>What changes across cost, availability, and personalization.</p>
        </div>
        <div className="dp-table-wrap">
          <table className="dp-table">
            <thead>
              <tr><th>Feature</th><th className="dp-highlight">SpeakUp</th><th>Traditional Classes</th><th>Other Apps</th></tr>
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

        {/* ── Deep-dive alternating blocks ── */}
        {costBlocks.map((b, i) => (
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
          <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80" alt="" />
          <div className="dp-banner-inner">
            <h3>Trusted by 50,000+ learners, without a single ad</h3>
            <p>We grew this far by making the free tier actually good — not by limiting it to push people toward a paid plan that doesn\u2019t exist.</p>
          </div>
        </div>

        {/* ── Extended comparison ── */}
        <div className="dp-section-head">
          <span className="dp-eyebrow"><DpIcon name="bar-chart-3" size={14} /> BEYOND THE BASICS</span>
          <h2>The details that add up over time</h2>
          <p>Small differences in setup, delay, and flexibility compound the longer you practice.</p>
        </div>
        <div className="dp-table-wrap">
          <table className="dp-table">
            <thead>
              <tr><th>What matters</th><th className="dp-highlight">SpeakUp</th><th>Traditional Classes</th><th>Other Apps</th></tr>
            </thead>
            <tbody>
              {extendedComparisonRows.map((row, i) => (
                <tr key={i}>
                  <td>{row.feature}</td>
                  <td className="dp-highlight">{row.speakup === true ? <DpIcon name="check" size={15} /> : row.speakup}</td>
                  <td>{row.traditional === false ? '—' : row.traditional === true ? <DpIcon name="check" size={15} /> : row.traditional}</td>
                  <td>{row.apps === true ? <DpIcon name="check" size={15} /> : row.apps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── FAQ ── */}
        <div className="dp-section-head">
          <span className="dp-eyebrow"><DpIcon name="message-square" size={14} /> FAQ</span>
          <h2>Questions people ask before switching</h2>
          <p>The honest answers, no marketing spin.</p>
        </div>
        <div className="dp-faq-list">
          {comparisonFaqs.map((f, i) => (
            <details className="dp-faq-item" key={i}>
              <summary>
                {f.q}
                <DpIcon name="arrow-left" size={16} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <QnASection pageSlug="comparison" />
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