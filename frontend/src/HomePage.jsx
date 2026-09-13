import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";
import api from "./api/axiosConfig.js";
import { useAuth } from "./context/AuthContext.jsx";
import './homepage.css';
import './pages/detailPages.css';
import BottomNav from './components/BottomNav.jsx';


const features = [
  { icon: 'mic', title: 'Voice Conversations', desc: 'Talk to our AI in real-time. It responds naturally, just like speaking with a real person.' },
  { icon: 'message-square', title: 'Instant Corrections', desc: 'Get grammar and pronunciation feedback instantly. Learn from every mistake you make.' },
  { icon: 'brain', title: 'AI-Powered Adaptation', desc: 'Our AI adjusts difficulty based on your skill level. Always challenged, never overwhelmed.' },
  { icon: 'bar-chart-3', title: 'Progress Tracking', desc: 'See your improvement over time with detailed analytics and weekly progress reports.' },
  { icon: 'globe', title: 'Multi-Language Support', desc: 'Learn English from 12+ native languages. Tamil, Hindi, Spanish, and more supported.' },
  { icon: 'trophy', title: 'Daily Challenges', desc: 'Complete daily speaking challenges to earn streaks, badges, and stay motivated.' },
];

// Real images per category — Unsplash source images, English-learning
// relevant (people talking, books, studying, headphones, etc).
const learningCategories = [
  { icon: 'mic', title: 'Speaking', desc: 'Practice real-time conversations and build confidence.', level: 'Beginner', slug: 'speaking', image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80' },
  { icon: 'message-square', title: 'Grammar', desc: 'Learn sentence structure with simple examples.', level: 'Intermediate', slug: 'grammar', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80' },
  { icon: 'bar-chart-3', title: 'Vocabulary', desc: 'Improve your daily words with smart revision.', level: 'Advanced', slug: 'vocabulary', image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80' },
  { icon: 'play-circle', title: 'Listening', desc: 'Understand fast English with audio practice.', level: 'Beginner', slug: 'listening', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
  { icon: 'sparkles', title: 'Pronunciation', desc: 'Speak more clearly with guided correction.', level: 'Intermediate', slug: 'pronunciation', image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=80' },
  { icon: 'trophy', title: 'Daily Practice', desc: 'Small daily tasks to keep your learning consistent.', level: 'Advanced', slug: 'daily-practice', image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80' },
];


const testimonials = [
  { avatar: 'P', name: 'Priya from Chennai', role: 'Software Engineer', text: '"I was terrified to speak English at work meetings. After 2 weeks on SpeakUp, I led my first presentation in English!"', slug: 'speaking', tryLabel: 'Try: Speaking practice' },
  { avatar: 'R', name: 'Raj from Mumbai', role: 'College Student', text: '"The instant correction feature is game-changing. I didn\'t even know I was making those grammar mistakes!"', slug: 'grammar', tryLabel: 'Try: Grammar practice' },
  { avatar: 'M', name: 'Maria from São Paulo', role: 'Marketing Manager', text: '"I tried 5 different apps. SpeakUp is the only one that actually makes me FEEL like I\'m having a real conversation."', slug: 'listening', tryLabel: 'Try: Listening practice' },
];

const socials = [
  { icon: 'twitter', url: 'https://twitter.com', label: 'Twitter / X' },
  { icon: 'instagram', url: 'https://instagram.com', label: 'Instagram' },
  { icon: 'linkedin', url: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: 'youtube', url: 'https://youtube.com', label: 'YouTube' },
  { icon: 'github', url: 'https://github.com', label: 'GitHub' },
  { icon: 'message-circle', url: 'https://discord.com', label: 'Discord' },
];

const contactDetails = [
  { icon: 'mail', label: 'Email', value: 'suthakani140@gmail.com' },
  { icon: 'phone', label: 'Phone', value: '+91 8300692164' },
  { icon: 'map-pin', label: 'Office', value: 'Tiruchendur, India' },
];

const navLinks = [
  { id: 'hero', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'learning-categories', label: 'Categories' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'testimonials', label: 'Reviews' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
];

const trustBadges = [
  { icon: 'shield-check', title: 'Privacy First', desc: 'Your conversations stay private. We never sell your data or show ads.' },
  { icon: 'graduation-cap', title: 'Expert-Built Curriculum', desc: 'Lessons designed with certified English trainers, not just an algorithm.' },
  { icon: 'users', title: '50,000+ Learners', desc: 'Trusted by learners across India and dozens of countries worldwide.' },
  { icon: 'infinity', title: 'Always Free', desc: 'No hidden fees, no premium paywall. Every feature, free forever.' },
];

const comparisonRows = [
  { feature: 'Cost', speakup: 'Free, forever', traditional: '₹5,000+ / month', apps: 'Free with paywalls' },
  { feature: 'Practice availability', speakup: '24/7, anytime', traditional: 'Fixed class schedule', apps: '24/7' },
  { feature: 'Real-time correction', speakup: 'Instant AI feedback', traditional: 'Only during class', apps: 'Limited or delayed' },
  { feature: 'Learns at your pace', speakup: 'Fully personalized', traditional: 'Fixed batch pace', apps: 'Partially adaptive' },
  { feature: 'Native language support', speakup: '40+ languages', traditional: 'Rarely offered', apps: 'Usually 1-2' },
];

const faqs = [
  { q: 'Is SpeakUp really 100% free?', a: 'Yes. Every feature — voice conversations, corrections, progress tracking — is free forever. No trial period, no hidden charges, no credit card required.' },
  { q: 'Do I need any prior English knowledge to start?', a: 'Not at all. SpeakUp adapts to complete beginners as well as advanced speakers, adjusting difficulty automatically as you improve.' },
  { q: 'Which native languages are supported?', a: 'We currently support 40+ native languages including Tamil, Hindi, Telugu, Spanish, Portuguese, Arabic, and Chinese, with more being added regularly.' },
  { q: 'How does the AI correct my mistakes?', a: 'As you speak, our AI listens in real time and gently points out grammar or pronunciation issues right after you finish talking, along with the correct way to say it.' },
  { q: 'Can I use SpeakUp on my phone?', a: 'Yes, SpeakUp works directly in your mobile browser — no separate app download needed. Just log in and start talking.' },
  { q: 'Is my data and conversation history private?', a: 'Yes. Your conversations are never sold or shared with advertisers. They\'re used only to personalize your own learning experience.' },
];

const heroStats = [
  { target: 50, suffix: 'K+', label: 'Active Learners' },
  { target: 120, suffix: '+', label: 'Languages Covered' },
  { target: 4.9, suffix: '★', label: 'User Rating', decimals: 1 },
  { target: 1, suffix: 'M+', label: 'Conversations' },
];

const achievements = [
  '50,000+ Active Learners',
  '120+ Languages Covered',
  '4.9★ Average Rating',
  '1,000,000+ Conversations Completed',
  '95% Report Improved Confidence',
  '24/7 AI Practice Partner',
  '100% Free, No Hidden Costs',
];

const streakMilestones = [
  { icon: 'flame', label: '3-Day Spark' },
  { icon: 'trophy', label: '7-Day Momentum' },
  { icon: 'award', label: '30-Day Streak Master' },
  { icon: 'infinity', label: '100-Day Legend' },
];

const wordsOfDay = [
  { word: 'Resilient', meaning: 'able to recover quickly from difficulties', example: 'She stayed resilient even after failing the interview twice.' },
  { word: 'Articulate', meaning: 'able to express ideas clearly and effectively', example: 'He gave an articulate answer during the meeting.' },
  { word: 'Candid', meaning: 'honest and straightforward', example: 'I appreciate your candid feedback on my presentation.' },
  { word: 'Meticulous', meaning: 'showing great attention to detail', example: 'Her meticulous planning made the event a success.' },
  { word: 'Ambitious', meaning: 'having a strong desire for success', example: 'He\'s ambitious about growing his career abroad.' },
];


// Default fallback shown before the backend value loads (or if it fails).
const DEFAULT_ANNOUNCEMENT = "🎉 100% Free Forever — Learn English with unlimited AI conversations, no trial, no credit card, ever!";
const defaultAvatarFor = user => {
  if (!user) return null;
  if (user.avatarUrl) return user.avatarUrl;
  const seed = user.username || user.email || 'speakup';
  const style = user.gender === 'female' ? 'micah' : user.gender === 'male' ? 'adventurer' : 'adventurer-neutral';
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
};

const Icon = ({ name, size = 24 }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = '';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      const paths = {
        'mic': '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
        'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
        'brain': '<path d="M12 5a3 3 0 1 0-5.3 2.7"/><path d="M12 5a3 3 0 1 1 5.3 2.7"/><path d="M9 12a3 3 0 1 0 6 0"/><path d="M9 12a3 3 0 0 1-3-3"/><path d="M15 12a3 3 0 0 0 3-3"/>',
        'bar-chart-3': '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
        'globe': '<circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
        'trophy': '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
        'mail': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
        'phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
        'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
        'twitter': '<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.4 2.4-8.6 7-8.8 2.1.2 3.8 1.4 5 3.4"/>',
        'instagram': '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
        'linkedin': '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
        'youtube': '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 18.6 0A2 2 0 0 1 23.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-18.6 0A2 2 0 0 1 2.5 17"/><path d="m9.5 7.5 5 4.5-5 4.5"/>',
        'github': '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3-1 6-3.5 6-7.8a7.9 7.9 0 0 0-2.4-5.7 7.8 7.8 0 0 0 .2-3.2 7.8 7.8 0 0 0-3 1.4A15.3 15.3 0 0 0 12 1a15.3 15.3 0 0 0-4.8 1.2 7.8 7.8 0 0 0-3-1.4 7.8 7.8 0 0 0 .2 3.2A7.9 7.9 0 0 0 2 9.2c0 4.3 3 6.8 6 7.8a4.8 4.8 0 0 0-1 3.5v4"/>',
        'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
        'rocket': '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84 1.43-2.16 1.43-3.16a2.86 2.86 0 0 0-2.86-2.86c-1 0-2.32.72-3.16 1.43"/><path d="M12 8h8"/><path d="M16 8v8"/><path d="M12 15.34l1.34-.92 2.66.92"/><circle cx="12" cy="4" r="2"/>',
        'play-circle': '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
        'sparkles': '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
        'route': '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
        'heart': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.91 0-3.63.76-4.5 2.14-.87-1.38-2.59-2.14-4.5-2.14A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
        'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
        'send': '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
        'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
        'check': '<path d="M20 6 9 17l-5-5"/>',
        'chrome': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" x2="12" y1="8" y2="8"/><line x1="3.95" x2="8.54" y1="6.06" y2="14"/><line x1="10.34" x2="16" y1="7.68" y2="21.17"/>',
        'menu': '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
        'megaphone': '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
        'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
        'award': '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
        'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
        'graduation-cap': '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
        'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'infinity': '<path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"/>',
        'chevron-down': '<path d="m6 9 6 6 6-6"/>',
        'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
        'target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
        'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
        'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        'arrow-right': '<line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/>',
        'bookmark': '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
      };

      if (paths[name]) svg.innerHTML = paths[name];
      ref.current.appendChild(svg);
    }
  }, [name, size]);
  return <span ref={ref} style={{ display: 'inline-flex', alignItems: 'center' }} />;
};

const CountUpStat = ({ target, suffix, label, decimals = 0 }) => {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const start = performance.now();
          const animate = now => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(target * eased);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div className="stat-item" ref={ref}>
      <div className="stat-num shimmer-text">{value.toFixed(decimals)}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

export default function HomePage() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const heroVideoRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [authMode, setAuthMode] = useState('login');
  const [authOpen, setAuthOpen] = useState(false);
  const [googleSignupInfo, setGoogleSignupInfo] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(true);
  const [announcementMsg, setAnnouncementMsg] = useState(DEFAULT_ANNOUNCEMENT);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const [todaysChallenge, setTodaysChallenge] = useState(null);
  const [challengeStatus, setChallengeStatus] = useState(null);
  const [liveStreak, setLiveStreak] = useState(null);
  // Track the last category the user practiced so the continue banner can
  // send them straight back into it — distinct from the floating "Practice
  // Now" button, which always goes to the full categories list
  const [lastCategorySlug, setLastCategorySlug] = useState(() => localStorage.getItem('lastCategorySlug'));
  const [savedWords, setSavedWords] = useState(() => {
    const stored = localStorage.getItem('savedWords');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    const v = heroVideoRef.current;
    if (v) {
      v.muted = true;
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          const resume = () => { v.play(); document.removeEventListener('click', resume); };
          document.addEventListener('click', resume, { once: true });
        });
      }
    }
  }, []);
    // Admins never see the homepage — bounce them straight to the
  // dashboard, whether they just logged in or navigated back here.
    useEffect(() => {
    api.get('/announcement')
      .then(({ data }) => {
        if (data.active && data.message) {
          setAnnouncementMsg(data.message);
        } else {
          setAnnouncementOpen(false);
        }
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0);
      const sectionIds = ['hero', 'features', 'learning-categories', 'how-it-works', 'testimonials', 'contact'];
      let current = 'hero';
      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 200) current = id;
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  return () => observer.disconnect();
}, [todaysChallenge]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') { setAuthOpen(false); setUserMenuOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onClickOutside = e => {
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const lastPing = localStorage.getItem('streakPingDate');
    if (lastPing === today) return;
    api.post('/user/activity/ping')
      .then(() => localStorage.setItem('streakPingDate', today))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) { setLiveStreak(null); return; }
    api.get('/user/progress')
      .then(({ data }) => setLiveStreak(data.streakDays))
      .catch(() => {});
  }, [user]);
  useEffect(() => {
  if (!user) return;
  api.get('/challenge/today')
    .then(({ data }) => {
      setTodaysChallenge(data.challenge);
      setChallengeStatus({ completed: data.completed, result: data.result });
    })
    .catch(err => {
      console.error('Challenge fetch failed:', err.response?.status, err.response?.data || err.message);
    });
}, [user]);
  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex(i => (i + 1) % wordsOfDay.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const openAuth = mode => { setAuthMode(mode); setAuthOpen(true); setLoginError(''); setSignupError(''); };
  const switchTab = mode => { setAuthMode(mode); setLoginError(''); setSignupError(''); setGoogleSignupInfo(null); };

  const showToast = msg => {
    setToastMsg(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 3500);
  };
   const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('Firebase returned email:', result.user.email);
    const { data } = await api.post('/auth/google', {
      email: result.user.email,
      username: result.user.displayName,
      photoUrl: result.user.photoURL,
      uid: result.user.uid,
    });

    if (data.newUser) {
      setGoogleSignupInfo({
        email: data.email,
        username: (data.username || '').replace(/[^a-zA-Z0-9 ]/g, '').trim(),
        photoUrl: data.photoUrl,
        uid: data.uid,
      });
      setAuthMode('signup');
      setAuthOpen(true);
      setSignupError('');
      return;
    }
    login(data.user, data.token);
    setAuthOpen(false);

    if (data.user.role === 'admin') {
      navigate('/admin');
      return;
    }
            const pendingCategory = sessionStorage.getItem('pendingCategory');
      if (pendingCategory) {
        sessionStorage.removeItem('pendingCategory');
        navigate(`/call/${pendingCategory}`);
        return;
      }
      const pendingPath = sessionStorage.getItem('pendingPath');
      if (pendingPath) {
        sessionStorage.removeItem('pendingPath');
        navigate(pendingPath);
        return;
      }
      navigate(data.user.level === 'unassigned' ? '/level-test' : '/categories');
    } catch (error) {
      console.log(error.code);
      console.log(error.message);
      showToast('Google sign-in failed — try again');
    }
  };

  const goOrAuth = (path, categorySlug) => {
    if (!user) {
      if (categorySlug) sessionStorage.setItem('pendingCategory', categorySlug);
      else sessionStorage.setItem('pendingPath', path);
      openAuth('signup');
      return;
    }
    navigate(path);
  };

  const handleLogin = async e => {
    e.preventDefault();
    const email = e.target.loginEmail.value;
    const password = e.target.loginPassword.value;
    if (!email || !password) { setLoginError('Please fill in all fields.'); return; }

    setLoginError('');
    setLoginLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user, data.token);
      setAuthOpen(false);

      // Admin accounts skip everything else and go straight to the
      // admin dashboard — no category/level-test flow for them.
      if (data.user.role === 'admin') {
        navigate('/admin');
        return;
      }

      const pendingCategory = sessionStorage.getItem('pendingCategory');
      if (pendingCategory) {
        sessionStorage.removeItem('pendingCategory');
        navigate(`/call/${pendingCategory}`);
        return;
      }
      const pendingPath = sessionStorage.getItem('pendingPath');
      if (pendingPath) {
        sessionStorage.removeItem('pendingPath');
        navigate(pendingPath);
        return;
      }
      navigate(data.user.level === 'unassigned' ? '/level-test' : '/categories');
    } catch (err) {
      if (err.response?.status === 403) {
        setAuthOpen(false);
        navigate('/verify-email', { state: { userId: err.response.data.userId, email } });
        return;
      }
      setLoginError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async e => {
    e.preventDefault();
    const username = e.target.signupName.value;
    const email = e.target.signupEmail.value;
    const nativeLanguage = e.target.signupLanguage.value;

    if (googleSignupInfo) {
      if (!username) { setSignupError('Please enter a username.'); return; }
      if (!nativeLanguage) { setSignupError('Please select your native language.'); return; }
      const gender = e.target.signupGender.value;

      setSignupError('');
      setSignupLoading(true);
      try {
        const { data } = await api.post('/auth/google-register', {
          email: googleSignupInfo.email,
          username,
          photoUrl: googleSignupInfo.photoUrl,
          uid: googleSignupInfo.uid,
          nativeLanguage,
          gender,
        });
        setGoogleSignupInfo(null);
        login(data.user, data.token);
        setAuthOpen(false);
        navigate(data.user.level === 'unassigned' ? '/level-test' : '/categories');
      } catch (err) {
        setSignupError(err.response?.data?.message || 'Registration failed');
      } finally {
        setSignupLoading(false);
      }
      return;
    }

    const password = e.target.signupPassword.value;
    const gender = e.target.signupGender.value;
    if (!username || !email || !password) { setSignupError('Please fill in all fields.'); return; }
    if (password.length < 6) { setSignupError('Password must be at least 6 characters.'); return; }
    if (!nativeLanguage) { setSignupError('Please select your native language.'); return; }

    setSignupError('');
    setSignupLoading(true);
    try {
      const { data } = await api.post('/auth/register', { username, email, password, nativeLanguage, gender });
      setAuthOpen(false);
      navigate('/verify-email', { state: { userId: data.userId, email } });
    } catch (err) {
      setSignupError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleContact = async e => {
  e.preventDefault();
  const form = e.target;
  try {
    await api.post('/contact', {
      firstName: form.elements[0].value,
      lastName: form.elements[1].value,
      email: form.elements[2].value,
      subject: form.elements[3].value,
      message: form.elements[4].value,
    });
    showToast('Message sent! We\'ll get back to you within 24 hours.');
    form.reset();
  } catch (err) {
    showToast('Could not send message — try again');
  }
};
  // handleCategoryClick
const handleCategoryClick = slug => {
  if (user) {
    localStorage.setItem('lastCategorySlug', slug);
    setLastCategorySlug(slug);
  }
  goOrAuth(`/learn/${slug}`, slug);   // was `/call/${slug}`
};

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    showToast('Logged out');
  };

  const handleSaveWord = async wordObj => {
  if (!user) {
    openAuth('signup');
    return;
  }
  try {
    await api.post('/user/vocabulary', {
      word: wordObj.word,
      meaning: wordObj.meaning,
      example: wordObj.example,
    });
    showToast(`Saved "${wordObj.word}" to your vocabulary`);
  } catch (err) {
    showToast(err.response?.data?.message || 'Could not save word — try again');
  }
};
  const handleCardTilt = e => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  };
  const resetCardTilt = e => {
    e.currentTarget.style.transform = '';
  };

  return (
    <div className="homepage-body">
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>

      {announcementOpen && (
        <div className="announcement-bar">
          <Icon name="megaphone" size={16} />
          <span>{announcementMsg}</span>
          <button className="announcement-close" onClick={() => setAnnouncementOpen(false)} aria-label="Dismiss announcement">
            <Icon name="x" size={14} />
          </button>
        </div>
      )}

      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <div className="noise"></div>
      <div className="bg-bubbles">
        {[...Array(14)].map((_, i) => (
          <div
            key={`bubble-${i}`}
            className="bg-bubble"
            style={{
              left: `${(i * 7.3) % 100}%`,
              width: `${10 + (i % 5) * 6}px`,
              height: `${10 + (i % 5) * 6}px`,
              animationDuration: `${11 + (i % 6) * 2}s`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="bg-sparkle"
            style={{
              left: `${(i * 8.6) % 100}%`,
              top: `${(i * 13.5) % 100}%`,
              animationDuration: '2.6s',
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}${announcementOpen ? ' with-announcement' : ''}`}>
        <div className="nav-brand" onClick={() => scrollTo('hero')}>
          <div className="nav-brand-icon"><Icon name="mic" size={20} /></div>
          SpeakUp
        </div>
        <ul className={`nav-links${mobileOpen ? ' mobile-open' : ''}`}>
          {navLinks.map(l => (
            <li key={l.id}>
              <a href={`#${l.id}`} className={activeSection === l.id ? 'active' : ''} onClick={e => { e.preventDefault(); scrollTo(l.id); }}>{l.label}</a>
            </li>
          ))}
        </ul>
        <div className="nav-actions">
          {user ? (
  user.role === "admin" ? (
    <div className="nav-user-menu" ref={userMenuRef}>
      <button className="nav-user-trigger nav-admin-trigger" onClick={() => setUserMenuOpen(v => !v)}>
        <span className="nav-user-avatar nav-admin-avatar">👑</span>
        <span className="nav-user-name">Admin</span>
      </button>
            {userMenuOpen && (
        <div className="nav-user-dropdown">
          <button onClick={() => { setUserMenuOpen(false); navigate('/categories'); }}>
            <Icon name="route" size={16} /> Categories
          </button>
          <button onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}>
            <Icon name="user" size={16} /> Profile
          </button>
          <button onClick={() => { setUserMenuOpen(false); navigate('/find-partner'); }}>
            <Icon name="users" size={16} /> Find a Partner
          </button>
          <button onClick={handleLogout}>
            <Icon name="x" size={16} /> Log Out
          </button>
        </div>
      )}
    </div>
    ) : (
    <div className="nav-user-menu" ref={userMenuRef}>
      <button className="nav-user-trigger" onClick={() => setUserMenuOpen(v => !v)}>
        <span className="nav-user-avatar">
          <img src={defaultAvatarFor(user)} alt="" />
        </span>
        <span className="nav-user-name">{user.username}</span>
      </button>
      {userMenuOpen && (
        <div className="nav-user-dropdown">
          <button onClick={() => { setUserMenuOpen(false); navigate('/categories'); }}>
            <Icon name="route" size={16} /> Categories
          </button>
          <button onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}>
            <Icon name="user" size={16} /> Profile
          </button>
          <button onClick={() => { setUserMenuOpen(false); navigate('/find-partner'); }}>
            <Icon name="users" size={16} /> Find a Partner
          </button>
          <button onClick={handleLogout}>
            <Icon name="x" size={16} /> Log Out
          </button>
        </div>
      )}
    </div>
  )
) : (
            <>
              <button className="btn-login" onClick={() => openAuth('login')}>Log In</button>
              <button className="btn-signup" onClick={() => openAuth('signup')}>Get Started</button>
            </>
          )}
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}><Icon name="menu" size={24} /></button>
        </div>
      </nav>

      <section className={`hero${announcementOpen ? ' with-announcement' : ''}`} id="hero">
        <div className="hero-video-wrap">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.pexels.com/videos/3255268/free-video-3255268.jpg?auto=compress&cs=tinysrgb&h=627&fit=crop&w=1200"
          >
            <source
              src="https://videos.pexels.com/video-files/3255268/3255268-uhd_2560_1440_25fps.mp4"
              type="video/mp4"
            />
          </video>
        </div>
        <div className="hero-content">
          <div className="hero-badge"><div className="hero-badge-dot"></div> Now Live — AI-Powered Learning</div>
          <h1>Speak English<br /><span className="gradient-text">With Confidence</span></h1>
          <p className="hero-desc">Master real conversations with AI-powered practice. Get instant feedback, track your progress, and speak like a native — all from your phone.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => goOrAuth('/categories')}><Icon name="rocket" size={18} /> Start Learning Free</button>
            <button className="btn-secondary" onClick={() => scrollTo('features')}><Icon name="play-circle" size={18} /> See How It Works</button>
          </div>
          <div className="hero-stats">
            {heroStats.map((s, i) => <CountUpStat key={i} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── CONTINUE BANNER — separate destination from the floating button:
          this goes back into the specific category last practiced (or
          /categories if none yet), while "Practice Now" always opens the
          full categories list. ── */}
      {user && user.role !== "admin" && (
  <div className="continue-banner-wrap">
          <div className="continue-banner reveal">
            <div className="continue-banner-left">
              <div className="continue-banner-icon"><Icon name="flame" size={22} /></div>
              <div>
                <div className="continue-banner-title">Welcome back, {user.username}!</div>
                <div className="continue-banner-sub">
                  {liveStreak
                    ? `You're on a ${liveStreak}-day streak — keep it alive today.`
                    : "Start today's practice to begin your streak."}
                </div>
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => navigate(lastCategorySlug ? `/call/${lastCategorySlug}` : '/categories')}
            >
              {lastCategorySlug ? 'Continue Where You Left Off' : 'Start Practicing'}
              <Icon name="arrow-right" size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="marquee-section reveal">
        <div className="marquee-track">
          {[...achievements, ...achievements].map((item, i) => (
            <div className="marquee-item" key={i}>
              <Icon name="zap" size={14} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="section trust-section">
        <div className="trust-grid">
          {trustBadges.map((t, i) => (
            <div className={`trust-card reveal reveal-delay-${(i % 3) + 1}`} key={i}>
              <div className="trust-icon"><Icon name={t.icon} size={26} /></div>
              <div className="trust-title">{t.title}</div>
              <div className="trust-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>
      {(!user || user.role !== "admin") && (
      <section className="section streak-section" id="streak">
        <div className="section-header reveal">
          <div className="section-tag"><Icon name="flame" size={14} /> STAY CONSISTENT</div>
          <h2 className="section-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/streak')}>Build Your Daily<br /><span className="gradient-text">Speaking Streak</span></h2>
          <p className="section-desc">Every conversation counts. Come back daily, keep your streak alive, and unlock milestones as you grow.</p>
        </div>
        <div className="streak-panel reveal">
          <div className="streak-flame-box">
            <div className="streak-flame-icon"><Icon name="flame" size={36} /></div>
            <div className="streak-count-num shimmer-text">{user ? (liveStreak ?? 0) : 0}</div>
            <div className="streak-count-label">
              {user
                ? (liveStreak ? 'day streak — keep it going!' : 'day streak — practice today to start')
                : 'day streak — start today'}
            </div>
            {!user && (
              <button className="streak-cta-btn" onClick={() => openAuth('signup')}>Start My Streak</button>
            )}
          </div>
          <div className="streak-badges">
            {streakMilestones.map((m, i) => (
              <div className="streak-badge" key={i}>
                <div className="streak-badge-icon"><Icon name={m.icon} size={20} /></div>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      <section className="section today-challenge-section">
  {todaysChallenge && (
    <div
      className={`today-challenge-card${challengeStatus?.completed ? ' today-challenge-done' : ''} reveal`}
      role="button" tabIndex={0}
      onClick={() => !challengeStatus?.completed && navigate(`/challenge/${todaysChallenge.slug}`)}
    >
      <div className="today-challenge-icon icon-pulse"><Icon name={todaysChallenge.icon} size={28} /></div>
      <div className="today-challenge-text">
        <div className="today-challenge-tag">TODAY'S CHALLENGE</div>
        <h3>{todaysChallenge.title}</h3>
        <p>{todaysChallenge.desc}</p>
        {challengeStatus?.completed && (
          <div className="today-challenge-result">
            ✓ {challengeStatus.result.score}/{challengeStatus.result.maxScore} — {challengeStatus.result.badgeAwarded ? 'Badge earned!' : 'Try again tomorrow'}
          </div>
        )}
      </div>
      {!challengeStatus?.completed && <div className="today-challenge-arrow"><Icon name="arrow-right" size={20} /></div>}
    </div>
  )}
</section>

      <section className="section" id="features">
        <div className="section-header reveal">
          <div className="section-tag"><Icon name="sparkles" size={14} /> FEATURES</div>
          <h2 className="section-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/features')}>Everything You Need to<br /><span className="gradient-text">Speak Fluently</span></h2>
          <p className="section-desc">Our AI doesn't just teach — it listens, corrects, and adapts to your level in real time.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className={`feature-card reveal reveal-delay-${(i % 3) + 1}`} key={i}>
              <div className="feature-icon"><Icon name={f.icon} size={24} /></div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="learning-categories">
        <div className="section-header reveal">
          <div className="section-tag"><Icon name="route" size={14} /> LEARNING CATEGORIES</div>
          <h2 className="section-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/learning-categories')}>Choose What You Want to<br /><span className="gradient-text">Learn</span></h2>
          <p className="section-desc">Pick a category and start learning English in the easiest way.</p>
        </div>
        <div className="learning-grid">
          {learningCategories.map((item, i) => (
            <div
              className={`learning-card reveal reveal-delay-${(i % 3) + 1}`}
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => handleCategoryClick(item.slug)}
              onKeyDown={e => { if (e.key === 'Enter') handleCategoryClick(item.slug); }}
              onMouseMove={handleCardTilt}
              onMouseLeave={resetCardTilt}
            >
              <div className="learning-card-shine"></div>
              <div className="learning-card-image">
                <img
  src={item.image}
  alt={item.title}
  loading="lazy"
  onError={e => {
    e.target.onerror = null;
    e.target.src = `https://placehold.co/600x400/0e1f19/10b981?text=${encodeURIComponent(item.title)}`;
  }}
/>
                <span className="learning-badge learning-badge-overlay">{item.level}</span>
              </div>
              <div className="learning-card-body">
                <div className="learning-icon icon-pulse"><Icon name={item.icon} size={22} /></div>
                <h3 className="learning-title">{item.title}</h3>
                <p className="learning-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section level-check-section" id="level-check">
        <div className="level-check-card reveal">
          <div className="level-check-icon"><Icon name="target" size={30} /></div>
          <div className="level-check-text">
            <h3>Not sure where you stand?</h3>
            <p>Take a quick 60-second check and we'll match lessons to your exact level — no guesswork, no wasted time.</p>
          </div>
          <button className="btn-primary" onClick={() => goOrAuth('/level-test')}>
            <Icon name="target" size={18} /> Take the Level Check
          </button>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="section-header reveal">
          <div className="section-tag"><Icon name="route" size={14} /> HOW IT WORKS</div>
          <h2 className="section-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/how-it-works')}>Three Steps to<br /><span className="gradient-text">Fluency</span></h2>
          <p className="section-desc">No complicated setup. Just sign up and start talking.</p>
        </div>
        <div className="steps-container reveal">
          <div className="steps-line"></div>
          {[
            { num: 1, title: 'Create Your Profile', desc: 'Sign up in 30 seconds. Choose your native language and current English level.' },
            { num: 2, title: 'Start Conversations', desc: 'Tap the mic and talk. Our AI listens, responds, and gently corrects your mistakes.' },
            { num: 3, title: 'Track & Improve', desc: 'Watch your fluency score rise. Unlock new levels as your confidence grows.' },
          ].map((s, i) => (
            <div className={`step-item reveal reveal-delay-${i + 1}`} key={i}>
              <div className="step-num">{s.num}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section word-section" id="vocab">
        <div className="section-header reveal">
          <div className="section-tag"><Icon name="book-open" size={14} /> VOCABULARY BOOST</div>
          <h2 className="section-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/vocabulary-boost')}>Pick Up a New Word<br /><span className="gradient-text">Every Time You Visit</span></h2>
          <p className="section-desc">Small daily additions build a powerful vocabulary over time.</p>
        </div>
        <div className="word-card reveal" key={wordIndex}>
          <div className="word-main-row">
  <div className="word-main">{wordsOfDay[wordIndex].word}</div>
  <button
  className="word-save-btn"
  onClick={() => handleSaveWord(wordsOfDay[wordIndex])}
  aria-label="Save word"
>
  <Icon name="bookmark" size={18} />
</button>
</div>
          <div className="word-meaning">{wordsOfDay[wordIndex].meaning}</div>
          <div className="word-example">"{wordsOfDay[wordIndex].example}"</div>
          <div className="word-dots">
            {wordsOfDay.map((_, i) => (
              <span key={i} className={`word-dot${i === wordIndex ? ' active' : ''}`}></span>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="comparison">
        <div className="section-header reveal">
          <div className="section-tag"><Icon name="bar-chart-3" size={14} /> WHY SPEAKUP</div>
          <h2 className="section-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/why-speakup')}>See How We<br /><span className="gradient-text">Stack Up</span></h2>
          <p className="section-desc">No coaching fees. No paywalled features. Just honest, effective practice.</p>
        </div>
        <div className="comparison-wrap reveal">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="comparison-highlight-col">SpeakUp</th>
                <th>Traditional Classes</th>
                <th>Other Apps</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={i}>
                  <td className="comparison-feature">{row.feature}</td>
                  <td className="comparison-highlight-col"><Icon name="check" size={16} /> {row.speakup}</td>
                  <td>{row.traditional}</td>
                  <td>{row.apps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" id="testimonials">
        <div className="section-header reveal">
          <div className="section-tag"><Icon name="heart" size={14} /> REVIEWS</div>
          <h2 className="section-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/reviews')}>Loved by Learners<br /><span className="gradient-text">Worldwide</span></h2>
          <p className="section-desc">Real stories from real people who transformed their English speaking skills.</p>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <div className={`testimonial-card reveal reveal-delay-${i + 1}`} key={i}>
              <div className="testimonial-stars">{[1,2,3,4,5].map(s => <Icon key={s} name="star" size={16} />)}</div>
              <div className="testimonial-text">{t.text}</div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div><div className="testimonial-name">{t.name}</div><div className="testimonial-role">{t.role}</div></div>
              </div>
<button className="testimonial-try-link" onClick={() => goOrAuth(`/learn/${t.slug}`, t.slug)}>
  {t.tryLabel} <Icon name="arrow-right" size={14} />
</button>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="faq">
        <div className="section-header reveal">
          <div className="section-tag"><Icon name="message-square" size={14} /> FAQ</div>
          <h2 className="section-title" style={{ cursor: 'pointer' }} onClick={() => navigate('/faq')}>Questions?<br /><span className="gradient-text">We've Got Answers</span></h2>
          <p className="section-desc">Everything you need to know before you start speaking.</p>
        </div>
        <div className="faq-list reveal">
          {faqs.map((f, i) => (
            <div className={`faq-item${openFaq === i ? ' faq-open' : ''}`} key={i}>
              <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                <span>{f.q}</span>
                <span className="faq-chevron"><Icon name="chevron-down" size={18} /></span>
              </button>
              <div className="faq-answer"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card reveal">
          <h2 className="cta-title">Ready to Speak Up?</h2>
          <p className="cta-desc">Join 50,000+ learners who are already speaking English confidently. Completely free, forever — no trial, no subscription.</p>
          <div className="cta-actions">
            <button className="btn-primary" onClick={() => goOrAuth('/categories')}><Icon name="rocket" size={18} /> Start Learning Free</button>
            <button className="btn-secondary" onClick={() => scrollTo('contact')}><Icon name="mail" size={18} /> Talk to Us</button>
          </div>
        </div>
      </section>

      <section className="section" id="contact">
        <div className="section-header reveal">
          <div className="section-tag"><Icon name="mail" size={14} /> CONTACT</div>
          <h2 className="section-title">Get in Touch<br /><span className="gradient-text">With Us</span></h2>
          <p className="section-desc">Have questions? We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
        </div>
        <div className="contact-container">
          <div className="contact-info-card reveal">
            <div className="contact-info-title">Let's Connect</div>
            <div className="contact-info-desc">Whether you have a question about features, how it works, or anything else, our team is ready to answer.</div>
            {contactDetails.map((d, i) => (
              <div className="contact-detail" key={i}>
                <div className="contact-detail-icon"><Icon name={d.icon} size={20} /></div>
                <div><div className="contact-detail-label">{d.label}</div><div className="contact-detail-value">{d.value}</div></div>
              </div>
            ))}
            <div className="contact-socials">
              {socials.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="social-link" title={s.label}><Icon name={s.icon} size={18} /></a>
              ))}
            </div>
          </div>
          <div className="contact-form-card reveal reveal-delay-2">
            <form className="contact-form" onSubmit={handleContact}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">First Name</label><input type="text" className="form-input" placeholder="Your first name" required /></div>
                <div className="form-group"><label className="form-label">Last Name</label><input type="text" className="form-input" placeholder="Your last name" required /></div>
              </div>
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" placeholder="you@example.com" required /></div>
              <div className="form-group"><label className="form-label">Subject</label><input type="text" className="form-input" placeholder="What's this about?" required /></div>
              <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" placeholder="Tell us more..." required></textarea></div>
              <button type="submit" className="btn-submit"><Icon name="send" size={16} /> Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer footer-advanced">
        <div className="footer-content-advanced footer-content-3col">

          {/* Column 1 — Brand + About */}
          <div className="footer-col footer-col-brand">
            <div className="footer-brand">
              <div className="footer-brand-icon"><Icon name="mic" size={16} /></div> SpeakUp
            </div>
            <p className="footer-about-text">
              Master real English conversations with AI-powered practice.
              Free forever — no trial, no credit card, ever.
            </p>
            <div className="footer-newsletter">
              <label className="footer-newsletter-label">Get learning tips in your inbox</label>
              <form
                className="footer-newsletter-form"
                onSubmit={e => {
                  e.preventDefault();
                  showToast("Subscribed! Check your inbox soon.");
                  e.target.reset();
                }}
              >
                <input
                  type="email"
                  className="footer-newsletter-input"
                  placeholder="you@example.com"
                  required
                />
                <button type="submit" className="footer-newsletter-btn" aria-label="Subscribe">
                  <Icon name="send" size={15} />
                </button>
              </form>
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div className="footer-col">
            <div className="footer-col-title">Quick Links</div>
            <ul className="footer-links footer-links-vertical">
              {navLinks.map(l => (
                <li key={l.id}>
                  <a href={`#${l.id}`} onClick={e => { e.preventDefault(); scrollTo(l.id); }}>{l.label}</a>
                </li>
              ))}
              {!user && <li><a href="#" onClick={e => { e.preventDefault(); openAuth('login'); }}>Log In</a></li>}
            </ul>
          </div>

          {/* Column 3 — Categories */}
          <div className="footer-col">
            <div className="footer-col-title">Categories</div>
            <ul className="footer-links footer-links-vertical">
              {learningCategories.map(c => (
                <li key={c.slug}>
                  <a
                    href="#"
                    onClick={e => { e.preventDefault(); handleCategoryClick(c.slug); }}
                  >
                    {c.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">© 2025 SpeakUp. Made with ❤️ in Tiruchendur. All rights reserved.</div>
          <div className="footer-bottom-links">
            <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
            <span className="footer-bottom-dot">•</span>
            <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>
          </div>
        </div>
      </footer>

      {authOpen && (
        <div className="auth-overlay active" onClick={e => { if (e.target.classList.contains('auth-overlay')) setAuthOpen(false); }}>
          <div className="auth-modal">
            <div className="auth-close" onClick={() => setAuthOpen(false)}><Icon name="x" size={18} /></div>
            <div className="auth-logo">
              <div className="auth-logo-icon"><Icon name="mic" size={22} /></div>
              <div className="auth-logo-text">SpeakUp</div>
            </div>
            <div className="auth-subtitle">
  {authMode === 'login'
    ? 'Welcome back! Log in to continue learning.'
    : googleSignupInfo
      ? 'Just a couple more details to finish setting up your account'
      : 'Create your account and start speaking!'}
</div>
            <div className="auth-tabs">
              <button className={`auth-tab${authMode === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>Log In</button>
              <button className={`auth-tab${authMode === 'signup' ? ' active' : ''}`} onClick={() => switchTab('signup')}>Sign Up</button>
            </div>

            {authMode === 'login' ? (
              <form className="auth-form" onSubmit={handleLogin}>
                <input type="email" className="auth-input" placeholder="Email address" name="loginEmail" required />
                <input type="password" className="auth-input" placeholder="Password" name="loginPassword" required />
                {loginError && <div className="auth-error">{loginError}</div>}
                <button type="submit" className="auth-btn" disabled={loginLoading}>
                  {loginLoading ? 'Logging in…' : 'Log In →'}
                </button>
                <div className="auth-divider"><div className="auth-divider-line"></div><div className="auth-divider-text">or</div><div className="auth-divider-line"></div></div>
                <button
                  type="button"
                  className="auth-google"
                  onClick={handleGoogleLogin}
                ><Icon name="chrome" size={18} /> Continue with Google</button>
              </form>
                        ) : (
                            <form className="auth-form" onSubmit={handleSignup} key={googleSignupInfo?.email || 'manual-signup'}>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Full name"
                  name="signupName"
                  defaultValue={googleSignupInfo?.username || ''}
                  required
                />
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Email address"
                  name="signupEmail"
                  defaultValue={googleSignupInfo?.email || ''}
                  disabled={!!googleSignupInfo}
                  required
                />
                {!googleSignupInfo && (
                  <input type="password" className="auth-input" placeholder="Create password" name="signupPassword" minLength={6} required />
                )}
                <div className="auth-gender-row">
                  <label className="auth-gender-option">
                    <input type="radio" name="signupGender" value="female" defaultChecked /> Girl
                  </label>
                  <label className="auth-gender-option">
                    <input type="radio" name="signupGender" value="male" /> Boy
                  </label>
                  <label className="auth-gender-option">
                    <input type="radio" name="signupGender" value="neutral" /> Prefer not to say
                  </label>
                </div>
                <select className="auth-input" name="signupLanguage" required defaultValue="">
                  <option value="" disabled>Your native language</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Malayalam">Malayalam</option>
                  <option value="Marathi">Marathi</option>
                  <option value="Bengali">Bengali</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="Punjabi">Punjabi</option>
                  <option value="Urdu">Urdu</option>
                  <option value="Odia">Odia</option>
                  <option value="Assamese">Assamese</option>
                  <option value="Konkani">Konkani</option>
                  <option value="Sindhi">Sindhi</option>
                  <option value="Nepali">Nepali</option>
                  <option value="Sinhala">Sinhala</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Italian">Italian</option>
                  <option value="Dutch">Dutch</option>
                  <option value="Russian">Russian</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Turkish">Turkish</option>
                  <option value="Persian">Persian</option>
                  <option value="Hebrew">Hebrew</option>
                  <option value="Swahili">Swahili</option>
                  <option value="Amharic">Amharic</option>
                  <option value="Chinese">Chinese (Mandarin)</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Vietnamese">Vietnamese</option>
                  <option value="Thai">Thai</option>
                  <option value="Indonesian">Indonesian</option>
                  <option value="Malay">Malay</option>
                  <option value="Tagalog">Tagalog (Filipino)</option>
                  <option value="Burmese">Burmese</option>
                  <option value="Khmer">Khmer</option>
                  <option value="Polish">Polish</option>
                  <option value="Ukrainian">Ukrainian</option>
                  <option value="Greek">Greek</option>
                  <option value="Romanian">Romanian</option>
                  <option value="Other">Other</option>
                </select>
                                {signupError && <div className="auth-error">{signupError}</div>}
                <button type="submit" className="auth-btn" disabled={signupLoading}>
                  {signupLoading ? 'Creating account…' : 'Create Account →'}
                </button>
              </form>
            )}

                        <div className="auth-footer">
              {authMode === 'login'
                ? <>New here? <a onClick={() => switchTab('signup')}>Create an account</a></>
                : <>Already have an account, or prefer Google? <a onClick={() => switchTab('login')}>Log in here</a></>}
            </div>
          </div>
        </div>
      )}
    

      {/* ── FLOATING PRACTICE BUTTON — always opens the full categories list,
          distinct from the continue banner's "go back to last category". ── */}
      <button className="floating-practice-btn" onClick={() => goOrAuth('/categories')} aria-label="Practice now">
        <span className="floating-practice-wave">
          <span></span><span></span><span></span><span></span>
        </span>
        <Icon name="mic" size={20} />
        <span className="floating-practice-label">Practice Now</span>
      </button>

      <div className={`toast${toastShow ? ' show' : ''}`}>
        <div className="toast-icon"><Icon name="check" size={14} /></div>
        <span>{toastMsg}</span>
      </div>

      <BottomNav />
    </div>
  );
}