import React from 'react';
import { useNavigate } from 'react-router-dom';
import DpTopBar from './DpTopBar.jsx';
import DpIcon from './DpIcon.jsx';
import QnASection from './QnASection.jsx';
import '../homepage.css';
import './detailPages.css';

const faqGroups = [
  {
    heading: 'Getting started',
    items: [
      { q: 'Is SpeakUp really 100% free?', a: 'Yes. Every feature — voice conversations, corrections, progress tracking — is free forever. No trial period, no hidden charges, no credit card required.' },
      { q: 'Do I need any prior English knowledge to start?', a: 'Not at all. SpeakUp adapts to complete beginners as well as advanced speakers, adjusting difficulty automatically as you improve.' },
      { q: 'Can I use SpeakUp on my phone?', a: 'Yes, SpeakUp works directly in your mobile browser — no separate app download needed. Just log in and start talking.' },
    ],
  },
  {
    heading: 'How the AI works',
    items: [
      { q: 'How does the AI correct my mistakes?', a: 'As you speak, our AI listens in real time and gently points out grammar or pronunciation issues right after you finish talking, along with the correct way to say it.' },
      { q: 'Which native languages are supported?', a: 'We currently support 40+ native languages including Tamil, Hindi, Telugu, Spanish, Portuguese, Arabic, and Chinese, with more being added regularly.' },
      { q: 'What happens if I stop mid-sentence or get stuck?', a: 'The AI waits, offers a gentle prompt or a simpler rephrasing, and never rushes you — the goal is confidence, not speed.' },
    ],
  },
  {
    heading: 'Privacy & data',
    items: [
      { q: 'Is my data and conversation history private?', a: 'Yes. Your conversations are never sold or shared with advertisers. They\u2019re used only to personalize your own learning experience.' },
      { q: 'Can I delete my account and data?', a: 'Yes, you can request full account and data deletion at any time from your profile settings.' },
    ],
  },
];

export default function FaqDetailPage() {
  const navigate = useNavigate();
  return (
    <div className="detail-page">
      <DpTopBar backLabel="Back to home" />

      <section className="dp-hero" style={{ minHeight: '42vh' }}>
        <img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1800&q=80" alt="" />
        <div className="dp-hero-inner">
          <span className="dp-eyebrow"><DpIcon name="message-square" size={14} /> FAQ</span>
          <h1>Questions? We've got answers</h1>
          <p>Everything you need to know before you start speaking — grouped so you can jump straight to what matters to you.</p>
        </div>
      </section>

      <div className="dp-body dp-body-narrow">
        {faqGroups.map((g, gi) => (
          <div key={gi} style={{ marginBottom: '52px' }}>
            <div className="dp-section-head" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.2rem' }}>{g.heading}</h2>
            </div>
            <div className="dp-faq-list" style={{ marginBottom: 0 }}>
              {g.items.map((f, i) => (
                <details className="dp-faq-item" key={i} open={gi === 0 && i === 0}>
                  <summary>{f.q}<DpIcon name="arrow-right" size={16} /></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}

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