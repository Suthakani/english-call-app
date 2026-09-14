import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DpTopBar from './DpTopBar.jsx';
import DpIcon from './DpIcon.jsx';
import QnASection from './QnASection.jsx';
import '../homepage.css';
import './detailPages.css';

const faqGroups = [
  {
    heading: 'Getting started',
    icon: 'rocket',
    items: [
      { q: 'Is SpeakUp really 100% free?', a: 'Yes. Every feature — voice conversations, corrections, progress tracking — is free forever. No trial period, no hidden charges, no credit card required.' },
      { q: 'Do I need any prior English knowledge to start?', a: 'Not at all. SpeakUp adapts to complete beginners as well as advanced speakers, adjusting difficulty automatically as you improve.' },
      { q: 'Can I use SpeakUp on my phone?', a: 'Yes, SpeakUp works directly in your mobile browser — no separate app download needed. Just log in and start talking.' },
      { q: 'How long does signing up take?', a: 'About 30 seconds with email or Google. After that, a short voice-based level check (roughly 60 seconds) matches lessons to you from your very first session.' },
    ],
  },
  {
    heading: 'How the AI works',
    icon: 'brain',
    items: [
      { q: 'How does the AI correct my mistakes?', a: 'As you speak, our AI listens in real time and gently points out grammar or pronunciation issues right after you finish talking, along with the correct way to say it.' },
      { q: 'Which native languages are supported?', a: 'We currently support 40+ native languages including Tamil, Hindi, Telugu, Spanish, Portuguese, Arabic, and Chinese, with more being added regularly.' },
      { q: 'What happens if I stop mid-sentence or get stuck?', a: 'The AI waits, offers a gentle prompt or a simpler rephrasing, and never rushes you — the goal is confidence, not speed.' },
      { q: 'Does the difficulty level change automatically?', a: 'Yes — the AI raises or lowers vocabulary and sentence complexity within the same conversation based on how you\u2019re doing, no manual level switching needed.' },
    ],
  },
  {
    heading: 'Streaks, challenges & progress',
    icon: 'flame',
    items: [
      { q: 'What counts toward my daily streak?', a: 'Any completed session — speaking, grammar, vocabulary, or listening — counts. Your streak day resets at your local midnight.' },
      { q: 'What happens if I miss a day?', a: 'Your streak resets to zero, but your longest-ever streak stays saved on your profile. Streak freezes (earned automatically at milestones) can protect one missed day.' },
      { q: 'How is my fluency score calculated?', a: 'It updates after every conversation based on grammar accuracy, vocabulary variety, and how naturally you responded — it\u2019s a trend to watch, not a strict grade.' },
    ],
  },
  {
    heading: 'Vocabulary & saved words',
    icon: 'book-open',
    items: [
      { q: 'How do I save a word to review later?', a: 'Tap the bookmark icon next to any word on the Vocabulary Boost page or the homepage widget — it\u2019s instantly added to your Vocabulary Bank on your profile.' },
      { q: 'Do saved words actually come up again in conversations?', a: 'Yes — the AI naturally weaves recently saved words into upcoming conversations so you get to practice using them, not just reading a definition.' },
      { q: 'Is there a limit to how many words I can save?', a: 'No. Saving vocabulary is completely free and unlimited on every account.' },
    ],
  },
  {
    heading: 'Privacy & data',
    icon: 'shield-check',
    items: [
      { q: 'Is my data and conversation history private?', a: 'Yes. Your conversations are never sold or shared with advertisers. They\u2019re used only to personalize your own learning experience.' },
      { q: 'Can I delete my account and data?', a: 'Yes, you can request full account and data deletion at any time from your profile settings — this permanently removes your profile, streak, vocabulary, and call history.' },
      { q: 'Do you show ads anywhere in the app?', a: 'No. SpeakUp has no ads anywhere, on any plan, since there\u2019s only one plan — free.' },
    ],
  },
  {
    heading: 'Account & billing',
    icon: 'lock',
    items: [
      { q: 'Do you ever plan to charge for features that are free today?', a: 'Features you already have free stay free. If new premium offerings appear in the future, today\u2019s core experience won\u2019t be pulled behind a paywall.' },
      { q: 'I signed up with Google — can I also set a password?', a: 'Currently Google sign-in accounts are managed through Google. Reach out via Contact if you need to add a separate password.' },
      { q: 'How do I change my native language after signing up?', a: 'Go to Profile → Settings, where your native language and other account details can be updated anytime.' },
    ],
  },
];

// Quick topic tiles at the top — clicking one scrolls straight to that
// FAQ group instead of making the visitor scan the whole page.
const topics = faqGroups.map(g => ({ heading: g.heading, icon: g.icon, count: g.items.length }));

export default function FaqDetailPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqGroups;
    return faqGroups
      .map(g => ({
        ...g,
        items: g.items.filter(item =>
          item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
        ),
      }))
      .filter(g => g.items.length > 0);
  }, [query]);

  const scrollToGroup = heading => {
    const el = document.getElementById(`faq-group-${heading.replace(/\s+/g, '-').toLowerCase()}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="detail-page">
      <div className="dp-bg-blobs">
        <div className="dp-blob dp-blob-1"></div>
        <div className="dp-blob dp-blob-2"></div>
      </div>
      <div className="dp-noise"></div>

      <DpTopBar backLabel="Back to home" />

      <section className="dp-hero" style={{ minHeight: '48vh' }}>
        <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1800&q=80" alt="" />
        <div className="dp-hero-inner">
          <span className="dp-eyebrow"><DpIcon name="message-square" size={14} /> FAQ</span>
          <h1>Questions? We've got answers</h1>
          <p>Everything you need to know before you start speaking — search below or browse by topic.</p>
        </div>
      </section>

      <div className="dp-body dp-body-narrow">

        {/* ── Search ── */}
        <div className="dp-qna-ask-form reveal" style={{ marginBottom: 50 }}>
          <input
            className="dp-qna-input"
            placeholder="Search questions — e.g. streak, privacy, native language…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>

        {/* ── Topic tiles (hidden while searching) ── */}
        {!query && (
          <div className="dp-grid" style={{ marginBottom: 80 }}>
            {topics.map((t, i) => (
              <div
                className="dp-card reveal"
                key={i}
                role="button"
                tabIndex={0}
                onClick={() => scrollToGroup(t.heading)}
                style={{ cursor: 'pointer', transitionDelay: `${(i % 3) * 0.1}s` }}
              >
                <div className="dp-card-icon"><DpIcon name={t.icon} size={22} /></div>
                <h3>{t.heading}</h3>
                <p>{t.count} question{t.count > 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── FAQ groups ── */}
        {filteredGroups.length === 0 ? (
          <p className="profile-empty" style={{ textAlign: 'center', marginBottom: 60 }}>
            No questions match "{query}" — try a different word, or ask below.
          </p>
        ) : (
          filteredGroups.map((g, gi) => (
            <div key={gi} id={`faq-group-${g.heading.replace(/\s+/g, '-').toLowerCase()}`} style={{ marginBottom: 60, scrollMarginTop: 100 }}>
              <div className="dp-section-head" style={{ textAlign: 'left', margin: '0 0 20px' }}>
                <span className="dp-eyebrow"><DpIcon name={g.icon} size={14} /> {g.heading.toUpperCase()}</span>
              </div>
              <div className="dp-faq-list reveal" style={{ marginBottom: 0 }}>
                {g.items.map((f, i) => (
                  <details className="dp-faq-item" key={i} open={!!query || (gi === 0 && i === 0)}>
                    <summary>{f.q}<DpIcon name="arrow-right" size={16} /></summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))
        )}

        {/* ── Still need help ── */}
        <div className="dp-banner reveal">
          <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80" alt="" />
          <div className="dp-banner-inner">
            <h3>Didn't find your answer?</h3>
            <p>Ask below and our team (or another learner) will reply directly — most questions get answered within a day.</p>
          </div>
        </div>

        {/* Didn't find your question above? Ask directly — admin replies
            show up as "Official Answer", other learners can pitch in too. */}
        <QnASection pageSlug="faq" />
      </div>

      <div className="dp-cta">
        <h2>Still have a question?</h2>
        <p>Send us a message and we'll reply within 24 hours.</p>
        <button className="dp-btn dp-btn-primary" onClick={() => navigate('/#contact')}>
          Contact us
        </button>
      </div>
    </div>
  );
}