import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DpTopBar from './DpTopBar.jsx';
import DpIcon from './DpIcon.jsx';
import '../homepage.css';
import './detailPages.css';

const categories = [
  {
    icon: 'mic',
    title: 'Speaking',
    level: 'Beginner',
    slug: 'speaking',
    desc: 'Real-time voice conversations on everyday situations — ordering food, small talk, describing your day — designed to get you talking without stopping to think about grammar first.',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=700&q=80',
    curriculum: [
      { title: 'Everyday small talk', detail: 'Greetings, weather, weekend plans — the conversations that open every interaction.' },
      { title: 'Ordering & requesting', detail: 'Restaurants, cafes, shops — asking for things politely and handling follow-up questions.' },
      { title: 'Describing your day', detail: 'Narrating events in the right tense, without translating word-for-word in your head.' },
      { title: 'Opinions & disagreement', detail: 'Saying what you think and pushing back politely, a skill most courses skip entirely.' },
    ],
  },
  {
    icon: 'message-square',
    title: 'Grammar',
    level: 'Intermediate',
    slug: 'grammar',
    desc: 'Sentence structure explained through examples pulled from your own conversations, not abstract rules copied from a textbook — so every lesson connects back to something you actually said.',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=700&q=80',
    curriculum: [
      { title: 'Tense in context', detail: 'When to use present perfect vs. simple past, shown through your own sentences.' },
      { title: 'Articles: a, an, the', detail: 'The rule non-native speakers ask about most, taught through pattern recognition.' },
      { title: 'Conditionals', detail: 'If-clauses for real plans, hypotheticals, and regrets, with side-by-side comparisons.' },
      { title: 'Common error patterns', detail: 'The five mistakes speakers of your native language make most, targeted directly.' },
    ],
  },
  {
    icon: 'bar-chart-3',
    title: 'Vocabulary',
    level: 'Advanced',
    slug: 'vocabulary',
    desc: 'Spaced-repetition word building — words you struggle with resurface more often, words you already know well fade into the background, so every session targets your actual gaps.',
    image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=700&q=80',
    curriculum: [
      { title: 'Core 1,000 words', detail: 'The high-frequency words that cover most everyday conversation.' },
      { title: 'Topic word packs', detail: 'Work, travel, health, finance — vocabulary grouped by the situations you actually face.' },
      { title: 'Idioms & phrasal verbs', detail: 'The expressions native speakers use constantly that textbooks translate literally and wrong.' },
      { title: 'Weekly recall test', detail: 'A short review that resurfaces exactly the words you are close to forgetting.' },
    ],
  },
  {
    icon: 'play-circle',
    title: 'Listening',
    level: 'Beginner',
    slug: 'listening',
    desc: 'Trains your ear on natural, fast, and accented English — the kind you actually hear in meetings, phone calls, and films, not the slowed-down audio from language apps.',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=700&q=80',
    curriculum: [
      { title: 'American & British accents', detail: 'Trains your ear to switch between the two most common accents you will encounter.' },
      { title: 'Meeting & workplace audio', detail: 'Real recorded-style clips of the language used in calls, standups, and reviews.' },
      { title: 'Fast natural speech', detail: 'Full speed audio with contractions and dropped sounds, the way people actually talk.' },
      { title: 'Comprehension drills', detail: 'Short questions after each clip that confirm what you actually understood.' },
    ],
  },
  {
    icon: 'sparkles',
    title: 'Pronunciation',
    level: 'Intermediate',
    slug: 'pronunciation',
    desc: 'Sound-by-sound correction on the vowels and consonants that don\u2019t exist in your native language, with guided repetition drills and instant audio feedback on every attempt.',
    image: 'https://images.unsplash.com/photo-1590650046871-92c887180603?auto=format&fit=crop&w=700&q=80',
    curriculum: [
      { title: 'Vowel sounds', detail: 'The vowels that don\u2019t exist in most native languages, isolated and drilled.' },
      { title: 'Consonant clusters', detail: 'Sounds like "th", "v", and "r" that are the most common source of miscommunication.' },
      { title: 'Word stress', detail: 'Where the emphasis falls in multi-syllable words, and why it changes meaning.' },
      { title: 'Recorded playback', detail: 'Hear your own attempt next to a native speaker\u2019s, side by side.' },
    ],
  },
  {
    icon: 'trophy',
    title: 'Daily Practice',
    level: 'Advanced',
    slug: 'daily-practice',
    desc: 'Short, five-minute challenges built for one goal: consistency. A daily streak beats one long study session a week, and every challenge adapts to what you struggled with yesterday.',
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=700&q=80',
    curriculum: [
      { title: 'Daily warm-up', detail: 'A two-minute mixed drill that reactivates yesterday\u2019s lesson before you begin.' },
      { title: 'Adaptive challenge', detail: 'One task chosen from your weakest skill, recalculated every day.' },
      { title: 'Streak tracking', detail: 'A visible daily streak, because consistency is the single biggest predictor of progress.' },
      { title: 'Milestone rewards', detail: 'Small unlocks at 7, 30, and 100 days to keep the habit going.' },
    ],
  },
];

const heroStats = [
  { num: '120K+', label: 'Active learners' },
  { num: '4.8', label: 'Average rating' },
  { num: '68%', label: 'Reach fluency in 6 months' },
];

const methodologySteps = [
  { title: 'Take the level check', detail: 'A short spoken and written assessment places you at the right starting point in every track.' },
  { title: 'Practice in short sessions', detail: 'Five to fifteen minutes a day, chosen from your weakest skill, beats one long weekly session.' },
  { title: 'Get corrected in the moment', detail: 'Feedback arrives while you\u2019re still mid-sentence, not three days later in a report.' },
  { title: 'Review what almost stuck', detail: 'Spaced repetition resurfaces exactly what you were close to forgetting, right before you forget it.' },
];

const comparisonRows = [
  { feature: 'Available any time of day', app: true, tutor: false, group: false },
  { feature: 'Personalised to your mistakes', app: true, tutor: true, group: false },
  { feature: 'Real-time pronunciation feedback', app: true, tutor: true, group: false },
  { feature: 'Cost per month', appText: 'Low', tutorText: 'High', groupText: 'Medium' },
  { feature: 'Scheduling required', app: false, tutor: true, group: true },
];

const testimonials = [
  { name: 'Priya R.', role: 'Product designer, learning for work calls', quote: 'The speaking track is the first thing that actually got me comfortable talking in meetings instead of just reading about grammar rules.' },
  { name: 'Daniel K.', role: 'Preparing for an international move', quote: 'Listening to real-speed audio instead of the slow, robotic clips other apps use made the biggest difference for me.' },
  { name: 'Aiko T.', role: 'University student', quote: 'Five minutes a day sounded too short to matter, but the streak kept me consistent and that mattered more than long sessions ever did.' },
];

const faqs = [
  { q: 'How do I know which track to start with?', a: 'Take the 60-second level check below — it looks at your current speaking, listening, and grammar level and recommends a starting track. You can always switch tracks later.' },
  { q: 'Do I need to complete a track in order?', a: 'No. Each track is self-paced and adapts its own difficulty to you. Most learners run two or three tracks in parallel.' },
  { q: 'How long until I notice progress?', a: 'Most learners notice a difference in listening comprehension within two weeks, and in speaking confidence within four to six weeks of daily practice.' },
  { q: 'Is this useful for a specific accent?', a: 'Yes. The Listening and Pronunciation tracks let you choose which accent to train on, and you can switch between them at any time.' },
  { q: 'Can I use this as a complete beginner?', a: 'Yes. Every track starts by placing you at the right difficulty level automatically, so beginners and advanced speakers both start in the right place.' },
];

export default function CategoriesDetailPage() {
  const navigate = useNavigate();
  const goOrAuth = slug => navigate(`/learn/${slug}`);
  const [openCurriculum, setOpenCurriculum] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="homepage-body">
      <div className="bg-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="noise" />

      <DpTopBar backLabel="Back to home" />

      <section className="section" style={{ paddingTop: '140px' }}>
        <div className="section-header">
          <span className="section-tag"><DpIcon name="route" size={14} /> Learning categories</span>
          <h1 className="section-title">Choose what you want to learn</h1>
          <p className="section-desc">Six focused tracks, each targeting a different skill. Start wherever your English is weakest, or work through all six as a complete self-paced curriculum.</p>
        </div>

        <div className="hero-stats" style={{ marginTop: 0, marginBottom: '56px' }}>
          {heroStats.map((s, i) => (
            <div className="stat-item" key={i}>
              <div className="stat-num shimmer-text">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="learning-grid">
          {categories.map((c, i) => {
            const isOpen = openCurriculum === c.slug;
            return (
              <div className="learning-card" key={i}>
                <div className="learning-card-shine" />
                <div className="learning-card-image">
                  <img src={c.image} alt={c.title} />
                  <span className="learning-badge learning-badge-overlay">{c.level}</span>
                </div>
                <div className="learning-card-body">
                  <div className="learning-card-top">
                    <div className="learning-icon icon-pulse">
                      <DpIcon name={c.icon} size={22} />
                    </div>
                  </div>
                  <h3 className="learning-title">{c.title}</h3>
                  <p className="learning-desc">{c.desc}</p>

                  <button
                    className="testimonial-try-link"
                    onClick={() => setOpenCurriculum(isOpen ? null : c.slug)}
                  >
                    {isOpen ? 'Hide curriculum' : 'See what\u2019s inside'}
                    <DpIcon name={isOpen ? 'chevron-up' : 'chevron-down'} size={14} />
                  </button>

                  {isOpen && (
                    <div className="learn-items" style={{ marginTop: '14px', marginBottom: '4px' }}>
                      {c.curriculum.map((item, ci) => (
                        <div className="learn-item" key={ci}>
                          <div className="learn-item-num">{ci + 1}</div>
                          <div>
                            <h4>{item.title}</h4>
                            <p>{item.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button className="learning-btn" onClick={() => goOrAuth(c.slug)}>
                    Start {c.title}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-tag">Method</span>
          <h2 className="section-title">How the method works</h2>
          <p className="section-desc">The same four-step loop runs underneath every track, whichever one you start with.</p>
        </div>
        <div className="steps-container">
          <div className="steps-line" />
          {methodologySteps.map((step, i) => (
            <div className="step-item" key={i}>
              <div className="step-num">{i + 1}</div>
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-tag">Comparison</span>
          <h2 className="section-title">How this compares</h2>
          <p className="section-desc">Set against a private tutor and a group class, for the things learners ask about most.</p>
        </div>
        <div className="comparison-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>This app</th>
                <th>Private tutor</th>
                <th>Group class</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={i}>
                  <td className="comparison-feature">{row.feature}</td>
                  <td className="comparison-highlight-col">
                    {row.appText ?? (row.app ? <><DpIcon name="check" size={15} /> Yes</> : '—')}
                  </td>
                  <td>{row.tutorText ?? (row.tutor ? <><DpIcon name="check" size={15} /> Yes</> : '—')}</td>
                  <td>{row.groupText ?? (row.group ? <><DpIcon name="check" size={15} /> Yes</> : '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-tag">Reviews</span>
          <h2 className="section-title">What learners say</h2>
          <p className="section-desc">A few of the people already working through these tracks.</p>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="testimonial-stars">
                {Array.from({ length: 5 }).map((_, si) => (
                  <DpIcon key={si} name="star" size={16} />
                ))}
              </div>
              <p className="testimonial-text">{t.quote}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-tag">FAQ</span>
          <h2 className="section-title">Frequently asked questions</h2>
          <p className="section-desc">Still deciding? Here's what most new learners ask first.</p>
        </div>
        <div className="faq-list">
          {faqs.map((f, i) => {
            const isOpen = openFaq === i;
            return (
              <div className={`faq-item${isOpen ? ' faq-open' : ''}`} key={i}>
                <button className="faq-question" onClick={() => setOpenFaq(isOpen ? null : i)}>
                  <span>{f.q}</span>
                  <span className="faq-chevron"><DpIcon name="chevron-down" size={16} /></span>
                </button>
                <div className="faq-answer">
                  <p>{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">Not sure where to start?</h2>
          <p className="cta-desc">Take the 60-second level check and we'll recommend the right track for you.</p>
          <div className="cta-actions">
            <button className="btn-primary" onClick={() => navigate('/level-test')}>
              <DpIcon name="target" size={16} /> Take the level check
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}