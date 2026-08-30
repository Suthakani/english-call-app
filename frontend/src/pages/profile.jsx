import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig.js';
import { useAuth } from '../context/AuthContext.jsx';
import './profile.css';
import BottomNav from '../components/BottomNav.jsx';
import AvatarBuilder from '../components/AvatarBuilder.jsx';
import ReactDOMServer from 'react-dom/server';
import { BigHead } from '@bigheads/core';
// Reuses the same lightweight lucide-style Icon renderer approach as homepage.jsx.
// If you already export Icon from a shared file, import that instead of duplicating.
const ICON_PATHS = {
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="4"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  'arrow-right': '<line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  'arrow-left': '<line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
};

const Icon = ({ name, size = 20 }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
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
    if (ICON_PATHS[name]) svg.innerHTML = ICON_PATHS[name];
    ref.current.appendChild(svg);
  }, [name, size]);
  return <span ref={ref} style={{ display: 'inline-flex', alignItems: 'center' }} />;
};

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'learning', label: 'Learning' },
  { id: 'settings', label: 'Settings' },
];

// BottomNav links to this page with ?tab=<id> so its "Progress" and
// "Profile" buttons land on genuinely different tabs instead of both
// opening the same default view. "progress" isn't one of TABS' own ids —
// it's an alias for "learning", since that's the tab that actually holds
// progress data (completed categories, recommendations, challenge history).
// Any other/missing ?tab= value falls back to the default "overview" tab.
const resolveTabFromQuery = search => {
  const tab = new URLSearchParams(search).get('tab');
  if (tab === 'progress') return 'learning';
  if (TABS.some(t => t.id === tab)) return tab;
  return 'overview';
};

// One named badge per Daily Challenge category. Slugs must match
// data/challenges.js on the backend. earnedSlugs holds slugs that have at
// least one perfect (all-correct) completion in the user's history.
const CHALLENGE_BADGES = [
  { slug: 'daily-listening', label: 'Sharp Listener' },
  { slug: 'speaking', label: 'Interview Ace' },
  { slug: 'grammar', label: 'Grammar Fixer' },
  { slug: 'vocabulary', label: 'Word Wizard' },
  { slug: 'pronunciation', label: 'Clear Speaker' },
];

// A real gold-medal-style badge: ribbon + circular disc with a star for
// earned badges, dimmed/locked look with a padlock for ones not earned yet.
const Medal = ({ slug, label, earned }) => {
  const gradId = `medalGold-${slug}`;
  const rimId = `medalRim-${slug}`;
  return (
    <div className={`medal${earned ? ' medal-earned' : ' medal-locked'}`}>
      <svg viewBox="0 0 64 86" width="60" height="80">
        <defs>
          <radialGradient id={gradId} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={earned ? '#fff6d8' : '#3a3a3a'} />
            <stop offset="45%" stopColor={earned ? '#f0c14b' : '#2a2a2a'} />
            <stop offset="100%" stopColor={earned ? '#b8860b' : '#1a1a1a'} />
          </radialGradient>
          <linearGradient id={rimId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={earned ? '#fff6d8' : '#4a4a4a'} />
            <stop offset="100%" stopColor={earned ? '#b8860b' : '#2a2a2a'} />
          </linearGradient>
        </defs>

        {/* ribbon tails */}
        <polygon points="21,0 43,0 50,32 32,22 14,32" className="medal-ribbon" />

        {/* outer rim + gold disc */}
        <circle cx="32" cy="54" r="25" fill={`url(#${rimId})`} />
        <circle cx="32" cy="54" r="21" fill={`url(#${gradId})`} />
        <circle cx="32" cy="54" r="21" className="medal-disc-edge" fill="none" />

        {earned ? (
          <path
            d="M32 40 L35.6 49.2 L45.4 49.8 L37.7 55.8 L40.3 65.2 L32 59.8 L23.7 65.2 L26.3 55.8 L18.6 49.8 L28.4 49.2 Z"
            className="medal-star"
          />
        ) : (
          <g className="medal-lock">
            <rect x="25" y="52" width="14" height="11" rx="2" />
            <path d="M27.5 52v-4a4.5 4.5 0 0 1 9 0v4" fill="none" strokeWidth="2.4" stroke="currentColor" strokeLinecap="round" />
          </g>
        )}
      </svg>
      <span className="medal-label">{label}</span>
    </div>
  );
};

// Anime-style preset avatars, generated via DiceBear (no upload needed).
// 'micah' reads as a softer/girl-leaning style, 'adventurer' as boy-leaning —
// swap these seeds/styles for your own art if you'd rather host fixed images.
const AVATAR_PRESETS = {
  girl: ['Aria', 'Luna', 'Mika', 'Nova', 'Sara', 'Yuki'].map(seed => ({
    seed, url: `https://api.dicebear.com/7.x/micah/svg?seed=${seed}`,
  })),
  boy: ['Kai', 'Leo', 'Ravi', 'Arjun', 'Dev', 'Sam'].map(seed => ({
    seed, url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`,
  })),
};

// ── Activity heatmap ──
// Builds a 12-week x 7-day grid ending on the upcoming Saturday of the
// current week (so "today" always lands in the last column), from an
// `activity` array of { date: 'YYYY-MM-DD', count: number }.
const buildHeatmapWeeks = activity => {
  const activityMap = {};
  activity.forEach(a => { activityMap[a.date] = a.count; });

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - dayOfWeek));

  const totalWeeks = 12;
  const start = new Date(end);
  start.setDate(start.getDate() - (totalWeeks * 7 - 1));

  const weeks = [];
  let cursor = new Date(start);
  for (let w = 0; w < totalWeeks; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = cursor.toISOString().slice(0, 10);
      const isFuture = cursor > today;
      days.push({ date: dateStr, count: activityMap[dateStr] || 0, isFuture });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(days);
  }
  return weeks;
};

const levelForCount = count => {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 2) return 2;
  if (count <= 4) return 3;
  return 4;
};

const ActivityHeatmap = ({ activity }) => {
  const weeks = buildHeatmapWeeks(activity);
  return (
    <div className="heatmap-wrap">
      <div className="heatmap-grid">
        {weeks.map((week, wi) => (
          <div className="heatmap-col" key={wi}>
            {week.map((day, di) => (
              <div
                key={di}
                className={`heatmap-cell${day.isFuture ? ' level-future' : ` level-${levelForCount(day.count)}`}`}
                title={day.isFuture ? '' : `${day.date}: ${day.count} ${day.count === 1 ? 'session' : 'sessions'}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        <span className="heatmap-cell level-0"></span>
        <span className="heatmap-cell level-1"></span>
        <span className="heatmap-cell level-2"></span>
        <span className="heatmap-cell level-3"></span>
        <span className="heatmap-cell level-4"></span>
        <span>More</span>
      </div>
    </div>
  );
};

// ── Weekly goal ring ──
const GoalRing = ({ completed, target }) => {
  const size = 88;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = target > 0 ? Math.min(completed / target, 1) : 0;
  const offset = circumference * (1 - pct);
  return (
    <svg width={size} height={size} className="goal-ring-svg">
      <defs>
        <linearGradient id="goalRingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#d4af37" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="url(#goalRingGrad)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="goal-ring-progress"
      />
      <text x="50%" y="53%" textAnchor="middle" className="goal-ring-text">{completed}/{target}</text>
    </svg>
  );
};

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateUser } = useAuth(); // adjust to whatever AuthContext actually exposes
  const fileInputRef = useRef(null);
  const avatarPickerRef = useRef(null);

  const [activeTab, setActiveTab] = useState(() => resolveTabFromQuery(location.search));
  const [profile, setProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
const [showAvatarPicker, setShowAvatarPicker] = useState(false);
const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
const [avatarConfig, setAvatarConfig] = useState(null);

const handleCustomAvatarSave = async (config) => {
  const svgMarkup = ReactDOMServer.renderToStaticMarkup(<BigHead {...config} />);
  const dataUri = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgMarkup)))}`;
  await applyPresetAvatar(dataUri);
  setAvatarConfig(config);
  setShowAvatarBuilder(false);
  setShowAvatarPicker(false);
};  const [form, setForm] = useState({ username: '', nativeLanguage: '' });
  const [notifOn, setNotifOn] = useState(true);
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('soundEffects') !== 'off');
  const [toast, setToast] = useState('');
  const [history, setHistory] = useState([]);

  // ── New: activity heatmap, weekly goal, vocab bank, call history, referral ──
  const [activity, setActivity] = useState([]);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [vocabWords, setVocabWords] = useState([]);
  const [callSessions, setCallSessions] = useState([]);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [vocabFilter, setVocabFilter] = useState('all'); // all | learning | known

  // ── Change password ──
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reminderTime, setReminderTime] = useState('19:00');

  // Re-sync the active tab whenever the URL's ?tab= changes — this page
  // doesn't remount when BottomNav links from /profile to /profile?tab=...
  // (same route, only the query differs), so the initial useState alone
  // wouldn't catch a later switch between "Progress" and "Profile" taps.
  useEffect(() => {
    setActiveTab(resolveTabFromQuery(location.search));
  }, [location.search]);

  useEffect(() => {
    api.get('/challenge/history')
      .then(({ data }) => setHistory(data))
      .catch(err => console.error('Failed to load challenge history:', err.response?.data || err.message));
  }, []);

  // Activity heatmap data — expects [{ date: 'YYYY-MM-DD', count: number }]
  useEffect(() => {
    api.get('/user/activity')
      .then(({ data }) => setActivity(data))
      .catch(err => console.error('Failed to load activity:', err.response?.data || err.message));
  }, []);

  // Saved vocabulary — expects [{ id, word, meaning, example, status }]
  useEffect(() => {
    api.get('/user/vocabulary')
      .then(({ data }) => setVocabWords(data))
      .catch(err => console.error('Failed to load vocabulary:', err.response?.data || err.message));
  }, []);

  // Past call sessions — expects [{ id, date, category, durationMinutes, correctionsCount, transcript: [{role,text}] }]
  useEffect(() => {
    api.get('/conversation/sessions')
      .then(({ data }) => setCallSessions(data))
      .catch(err => console.error('Failed to load call sessions:', err.response?.data || err.message));
  }, []);

  // Sync local weekly-goal target once progress loads (progress.weeklyGoal.target)
  useEffect(() => {
    if (progress?.weeklyGoal?.target) setWeeklyGoal(progress.weeklyGoal.target);
  }, [progress]);
 

  useEffect(() => {
    if (profile?.reminderTime) setReminderTime(profile.reminderTime);
  }, [profile]);
  useEffect(() => {
  localStorage.setItem('soundEffects', soundOn ? 'on' : 'off');
}, [soundOn]);

  // Close the avatar picker on an outside click (but not on the camera
  // button itself, which already toggles it open/closed).
  useEffect(() => {
    if (!showAvatarPicker) return;
    const handleClickOutside = e => {
      if (avatarPickerRef.current && !avatarPickerRef.current.contains(e.target)) {
        setShowAvatarPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAvatarPicker]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [{ data: profileData }, { data: progressData }] = await Promise.all([
          api.get('/user/profile'),
          api.get('/user/progress'),
        ]);
        if (!active) return;
        setProfile(profileData);
        setForm({ username: profileData.username, nativeLanguage: profileData.nativeLanguage });
        setProgress(progressData);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Badges earned from Daily Challenge submissions where every answer was
  // correct (badgeAwarded truthy on that history entry). Tracked per
  // challenge slug so each category gets its own medal.
  const earnedSlugs = new Set(history.filter(h => h.badgeAwarded).map(h => h.slug));
  const badgeCount = earnedSlugs.size;

  const handleAvatarChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { data } = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(p => ({ ...p, avatarUrl: data.avatarUrl }));
      updateUser?.({ avatarUrl: data.avatarUrl });
      setShowAvatarPicker(false);
      showToast('Profile photo updated');
    } catch (err) {
      showToast('Could not upload photo');
    }
  };

  const applyPresetAvatar = async url => {
    try {
      const { data } = await api.put('/user/profile', { avatarUrl: url });
      setProfile(data);
      updateUser?.({ avatarUrl: url });
      showToast('Avatar updated');
    } catch (err) {
      showToast('Could not update avatar');
    }
  };
  
  const saveDetails = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/user/profile', form);
      setProfile(data);
      setEditingDetails(false);
      showToast('Profile updated');
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setPwError('Please fill in both fields');
      return;
    }
    setPwError('');
    setPwSaving(true);
    try {
      await api.put('/user/change-password', pwForm);
      showToast('Password updated successfully');
      setShowPasswordForm(false);
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Could not update password');
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const updateReminderTime = async time => {
    setReminderTime(time);
    try {
      await api.put('/user/profile', { reminderTime: time });
    } catch (err) {
      console.error('Failed to update reminder time');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/user/account');
      logout();
      navigate('/');
    } catch (err) {
      showToast('Could not delete account');
      setShowDeleteConfirm(false);
    }
  };

  const handleExportData = async () => {
    try {
      const { data } = await api.get('/user/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `speakup-data-${profile?.username || 'export'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Could not export data');
    }
  };

  // Tab clicks update the URL's ?tab= too (not just local state), so the
  // BottomNav's active-state check (which compares against location.search)
  // stays in sync even when the user switches tabs by clicking inside the
  // page instead of tapping the bottom bar.
  const selectTab = id => {
    setActiveTab(id);
    const queryTab = id === 'learning' ? 'progress' : id;
    navigate(`/profile${queryTab === 'overview' ? '' : `?tab=${queryTab}`}`, { replace: true });
  };

  // ── Weekly goal: bump target up/down, persist to backend ──
  const adjustWeeklyGoal = async delta => {
    const next = Math.min(7, Math.max(1, weeklyGoal + delta));
    setWeeklyGoal(next);
    try {
      await api.put('/user/weekly-goal', { target: next });
    } catch (err) {
      console.error('Failed to update weekly goal:', err.response?.data || err.message);
    }
  };

  // ── Vocabulary: toggle a saved word between "learning" and "known" ──
  const toggleWordStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'known' ? 'learning' : 'known';
    setVocabWords(words => words.map(w => (w.id === id ? { ...w, status: nextStatus } : w)));
    try {
      await api.put(`/user/vocabulary/${id}`, { status: nextStatus });
    } catch (err) {
      console.error('Failed to update word status:', err.response?.data || err.message);
    }
  };

  const visibleVocabWords = vocabWords.filter(w => vocabFilter === 'all' || w.status === vocabFilter);

  // ── Invite friends: referral link + copy ──
  const referralCode = user?.referralCode || `SPEAKUP-${(profile?.username || 'USER').slice(0, 4).toUpperCase()}`;
  const referralLink = `https://speakup.app/join?ref=${referralCode}`;
  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      showToast('Referral link copied!');
    } catch (err) {
      showToast('Could not copy link — copy it manually');
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading your profile…</div>;
  }

  const personalBests = progress?.personalBests || {};
  const weeklyCompleted = progress?.weeklyGoal?.completed ?? 0;

  return (
    <div className="profile-page">
      <div className="profile-bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <button className="profile-back-home" onClick={() => navigate('/')}>
        <Icon name="arrow-left" size={16} /> Back to Home
      </button>

            <div className="profile-header">
        <div className="profile-avatar-wrap">
          <img
            className="profile-avatar"
            src={profile?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + (profile?.username || 'U')}
            alt="Profile photo"
          />
          <button className="profile-avatar-edit" onClick={() => setShowAvatarPicker(v => !v)} aria-label="Choose avatar">
            <Icon name="camera" size={16} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
        </div>
        <div className="profile-header-text">
          <h1>{profile?.username}</h1>
          <p>{profile?.email}</p>
          <div className="profile-level-badge"><Icon name="target" size={14} /> Level: {profile?.level || 'Unassigned'}</div>
        </div>
        <button className="profile-logout" onClick={handleLogout}><Icon name="log-out" size={16} /> Log Out</button>
      </div>

      {showAvatarPicker && (
        <div className="avatar-picker-overlay" onClick={(e) => { if (e.target.classList.contains('avatar-picker-overlay')) setShowAvatarPicker(false); }}>
          <div className="profile-avatar-picker" ref={avatarPickerRef}>
            <div className="profile-avatar-picker-header">
              <span>Choose an avatar</span>
              <div className="profile-avatar-picker-header-actions">
                <button onClick={() => fileInputRef.current?.click()} className="profile-avatar-upload-link">
                  or upload a photo
                </button>
                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="profile-avatar-picker-close"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

            </div>
            <div className="profile-avatar-picker-group">
  <span className="profile-avatar-picker-label">Custom Avatar</span>
  <button
    className="profile-avatar-upload-link"
    onClick={() => { setShowAvatarBuilder(true); setShowAvatarPicker(false); }}
  >
    🎨 Build your own avatar
  </button>

            </div>
            <div className="profile-avatar-picker-group">
              <span className="profile-avatar-picker-label">Boy</span>
              <div className="profile-avatar-grid">
                {AVATAR_PRESETS.boy.map(a => (
                  <img key={a.seed} src={a.url} alt="" className="profile-avatar-option"
                    onClick={() => { applyPresetAvatar(a.url); setShowAvatarPicker(false); }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {showAvatarBuilder && (
  <div className="avatar-picker-overlay" onClick={(e) => { if (e.target.classList.contains('avatar-picker-overlay')) setShowAvatarBuilder(false); }}>
    <div className="profile-avatar-picker" style={{ width: 380 }}>
      <AvatarBuilder
        initialConfig={avatarConfig}
        onSave={handleCustomAvatarSave}
        onCancel={() => setShowAvatarBuilder(false)}
      />
    </div>
  </div>
)}
      <div className="profile-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`profile-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => selectTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="profile-section-grid" key="overview">
                    <div className="profile-card">
  <div className="profile-card-title"><Icon name="flame" size={18} /> Streak</div>
  <div className="profile-streak-num">{progress?.streakDays ?? 0}</div>
  <div className="profile-card-sub freeze-sub-row">
    <span>
      day streak · ❄️ {profile?.streakFreezeCount ?? 0} freeze{profile?.streakFreezeCount === 1 ? '' : 's'} left
    </span>
    <span className="freeze-info-wrap">
      <span className="freeze-info-icon" tabIndex={0}>ⓘ</span>
      <span className="freeze-info-tooltip">
        Earn freezes automatically: +1 at a 7-day streak, +2 at 30-day, +5 at 100-day.
        Also earn +1 whenever you hit your weekly goal. A freeze auto-protects
        your streak if you miss exactly one day. Max 3 freezes stored at once.
      </span>
    </span>
  </div>
</div>
          <div className="profile-card">
            <div className="profile-card-title"><Icon name="check-circle" size={18} /> Lessons Completed</div>
            <div className="profile-streak-num">{progress?.lessonsCompleted ?? 0}</div>
            <div className="profile-card-sub">of {progress?.totalLessons ?? '—'} total</div>
          </div>

          {/* ── NEW: Weekly Goal Ring ── */}
          <div className="profile-card goal-ring-card">
            <div className="profile-card-title"><Icon name="calendar" size={18} /> This Week's Goal</div>
            <div className="goal-ring-body">
              <GoalRing completed={weeklyCompleted} target={weeklyGoal} />
              <div className="goal-ring-controls">
                <span className="profile-card-sub">days this week</span>
                <div className="goal-ring-adjust">
                  <button onClick={() => adjustWeeklyGoal(-1)} aria-label="Decrease goal">−</button>
                  <span>{weeklyGoal} / week</span>
                  <button onClick={() => adjustWeeklyGoal(1)} aria-label="Increase goal">+</button>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-card profile-card-clickable" onClick={() => navigate('/leaderboard')}>
            <div className="profile-card-title"><Icon name="trophy" size={18} /> Leaderboard</div>
            <div className="profile-card-sub" style={{ marginTop: 6 }}>See how your streak ranks against other learners</div>
            <div className="profile-leaderboard-link"><Icon name="arrow-right" size={14} /> View rankings</div>
          </div>

          {/* ── NEW: Personal Best Stats ── */}
          <div className="profile-card profile-card-wide">
            <div className="profile-card-title"><Icon name="zap" size={18} /> Personal Bests</div>
            <div className="personal-bests-grid">
              <div className="best-stat">
                <div className="best-stat-num">{personalBests.longestStreak ?? '—'}</div>
                <div className="best-stat-label">Longest streak (days)</div>
              </div>
              <div className="best-stat">
                <div className="best-stat-num">{personalBests.mostWordsInCall ?? '—'}</div>
                <div className="best-stat-label">Most words in one call</div>
              </div>
              <div className="best-stat">
                <div className="best-stat-num">{personalBests.longestCallMinutes ?? '—'}</div>
                <div className="best-stat-label">Longest call (min)</div>
              </div>
              <div className="best-stat">
                <div className="best-stat-num">{personalBests.bestChallengeScore ?? '—'}</div>
                <div className="best-stat-label">Best challenge score</div>
              </div>
            </div>
          </div>

          <div className="profile-card profile-card-wide">
            <div className="profile-card-title profile-badge-title"><Icon name="award" size={18} /> Daily Challenge Badges</div>
            <div className="medal-grid">
              {CHALLENGE_BADGES.map(b => (
                <Medal key={b.slug} slug={b.slug} label={b.label} earned={earnedSlugs.has(b.slug)} />
              ))}
            </div>
            <div className="profile-card-sub" style={{ marginTop: 14 }}>
              {badgeCount} of {CHALLENGE_BADGES.length} badges earned — get every answer right in a challenge to unlock its badge
            </div>
          </div>
          <div className="profile-card profile-card-wide">
            <div className="profile-card-title">Profile Details</div>
            {!editingDetails ? (
              <div className="profile-details-view">
                <div><span>Name</span><strong>{profile?.username}</strong></div>
                <div><span>Native language</span><strong>{profile?.nativeLanguage}</strong></div>
                <button className="profile-edit-btn" onClick={() => setEditingDetails(true)}>
                  <Icon name="edit" size={14} /> Edit
                </button>
              </div>
            ) : (
              <div className="profile-details-edit">
                <input
                  className="profile-input"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="Name"
                />
                <input
                  className="profile-input"
                  value={form.nativeLanguage}
                  onChange={e => setForm(f => ({ ...f, nativeLanguage: e.target.value }))}
                  placeholder="Native language"
                />
                <div className="profile-edit-actions">
                  <button className="btn-secondary" onClick={() => setEditingDetails(false)}>Cancel</button>
                  <button className="btn-primary" onClick={saveDetails} disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'learning' && (
        <div className="profile-learning" key="learning">
          {/* ── NEW: Practice Calendar (activity heatmap) ── */}
          <div className="profile-subsection">
            <h3><Icon name="calendar" size={16} /> Practice Calendar</h3>
            <ActivityHeatmap activity={activity} />
          </div>

          <div className="profile-subsection">
            <h3>What you've learned</h3>
            <div className="profile-learned-grid">
              {(progress?.completedCategories || []).length === 0 && (
                <p className="profile-empty">No lessons completed yet — start your first one below.</p>
              )}
              {(progress?.completedCategories || []).map((c, i) => (
                <div className="profile-learned-chip" key={i}>
                  <Icon name="check-circle" size={14} /> {c.title} — {c.lessonsDone}/{c.lessonsTotal}
                </div>
              ))}
            </div>
          </div>

          {/* ── NEW: Vocabulary Bank ── */}
          <div className="profile-subsection">
            <h3><Icon name="book-open" size={16} /> My Vocabulary Bank</h3>
            <div className="vocab-filters">
              {['all', 'learning', 'known'].map(f => (
                <button
                  key={f}
                  className={`vocab-filter-chip${vocabFilter === f ? ' active' : ''}`}
                  onClick={() => setVocabFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'learning' ? 'Still learning' : 'Known'}
                </button>
              ))}
            </div>
            {visibleVocabWords.length === 0 ? (
              <p className="profile-empty">
                No saved words yet — save words from the "Word Booster" section on the home page to build your bank here.
              </p>
            ) : (
              <div className="vocab-grid">
                {visibleVocabWords.map(w => (
                  <div className={`vocab-card${w.status === 'known' ? ' vocab-known' : ''}`} key={w.id}>
                    <div className="vocab-word">{w.word}</div>
                    <div className="vocab-meaning">{w.meaning}</div>
                    {w.example && <div className="vocab-example">"{w.example}"</div>}
                    <button className="vocab-toggle-btn" onClick={() => toggleWordStatus(w.id, w.status)}>
                      {w.status === 'known' ? '✓ Known' : 'Mark as known'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="profile-subsection">
            <h3>Recommended next</h3>
            <div className="profile-next-list">
              {(progress?.recommendedNext || []).map((n, i) => (
                <div className="profile-next-card" key={i} onClick={() => navigate(`/call/${n.slug}`)}>
                  <div>
                    <div className="profile-next-title">{n.title}</div>
                    <div className="profile-next-reason">{n.reason}</div>
                  </div>
                  <Icon name="arrow-right" size={18} />
                </div>
              ))}
              {(!progress?.recommendedNext || progress.recommendedNext.length === 0) && (
                <p className="profile-empty">Complete a lesson to unlock personalized recommendations.</p>
              )}
            </div>
          </div>

          {/* ── NEW: Call History / Transcripts ── */}
          <div className="profile-subsection">
            <h3><Icon name="clock" size={16} /> Call History</h3>
            {callSessions.length === 0 ? (
              <p className="profile-empty">No calls yet — your practice call history and transcripts will show up here.</p>
            ) : (
              <div className="call-history-list">
                {callSessions.map(s => (
                  <div className="call-history-item" key={s.id}>
                    <div
                      className="call-history-row"
                      onClick={() => setExpandedSessionId(id => (id === s.id ? null : s.id))}
                    >
                      <div className="call-history-main">
                        <span className="call-history-category">{s.category}</span>
                        <span className="call-history-date">{s.date}</span>
                      </div>
                      <div className="call-history-meta">
                        <span>{s.durationMinutes} min</span>
                        <span>{s.correctionsCount} corrections</span>
                        <span className={`call-history-chevron${expandedSessionId === s.id ? ' open' : ''}`}>
                          <Icon name="chevron-down" size={16} />
                        </span>
                      </div>
                    </div>
                    {expandedSessionId === s.id && (
                      <div className="call-transcript">
                        {(s.transcript || []).length === 0 ? (
                          <p className="profile-empty">Transcript not available for this call.</p>
                        ) : (
                          s.transcript.map((line, i) => (
                            <div className={`transcript-line transcript-${line.role === 'You' ? 'you' : 'ai'}`} key={i}>
                              <strong>{line.role}:</strong> {line.text}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="profile-subsection">
            <h3>Daily Challenge History</h3>
            <div className="profile-challenge-history">
              {history.length === 0 && (
                <p className="profile-empty">No challenges completed yet — try today's challenge from the home page.</p>
              )}
              {history.map(h => (
                <div key={h.date} className={`history-row${h.badgeAwarded ? ' history-row-badge' : ''}`}>
                  <span>{h.date}</span>
                  <span>{h.slug}</span>
                  <span>{h.score}/{h.maxScore}</span>
                  <span>{h.badgeAwarded ? '🏅 Badge' : h.passed ? 'Passed' : 'Missed'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
  <div className="profile-settings" key="settings">
    <div className="profile-settings-row">
      <div className="profile-settings-label"><Icon name="bell" size={18} /> Notifications</div>
      <label className="profile-toggle">
        <input type="checkbox" checked={notifOn} onChange={() => setNotifOn(v => !v)} />
        <span className="profile-toggle-track"><span className="profile-toggle-thumb"></span></span>
      </label>
    </div>
    {notifOn && (
      <div className="profile-settings-row">
        <div className="profile-settings-label"><Icon name="clock" size={18} /> Reminder time</div>
        <input
          type="time"
          className="profile-time-input"
          value={reminderTime}
          onChange={e => updateReminderTime(e.target.value)}
        />
      </div>
    )}
    <div className="profile-settings-row">
      <div className="profile-settings-label"><Icon name="bell" size={18} /> Sound effects</div>
      <label className="profile-toggle">
        <input type="checkbox" checked={soundOn} onChange={() => setSoundOn(v => !v)} />
        <span className="profile-toggle-track"><span className="profile-toggle-thumb"></span></span>
      </label>
    </div>
    <div className="profile-settings-row">
      <div className="profile-settings-label"><Icon name="globe" size={18} /> Native language</div>
      <span className="profile-settings-value">{profile?.nativeLanguage}</span>
    </div>
    <div
      className="profile-settings-row profile-settings-row-clickable"
      onClick={() => { setShowPasswordForm(v => !v); setPwError(''); }}
    >
      <div className="profile-settings-label"><Icon name="lock" size={18} /> Change password</div>
      <Icon name="arrow-right" size={16} />
    </div>

    {showPasswordForm && (
      <div className="profile-password-form">
        <input
          type="password"
          className="profile-input"
          placeholder="Current password"
          value={pwForm.currentPassword}
          onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
        />
        <input
          type="password"
          className="profile-input"
          placeholder="New password"
          value={pwForm.newPassword}
          onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
        />
        {pwError && <div className="profile-pw-error">{pwError}</div>}
        <div className="profile-edit-actions">
          <button
            className="btn-secondary"
            onClick={() => {
              setShowPasswordForm(false);
              setPwError('');
              setPwForm({ currentPassword: '', newPassword: '' });
            }}
          >
            Cancel
          </button>
          <button className="btn-primary" onClick={handleChangePassword} disabled={pwSaving}>
            {pwSaving ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </div>
    )}

    <div className="invite-friends-card">
      <div className="invite-friends-header">
        <Icon name="gift" size={20} />
        <div>
          <div className="invite-friends-title">Invite Friends</div>
          <div className="invite-friends-sub">Share your link — you both get a reward when they join.</div>
        </div>
      </div>
      <div className="invite-friends-link-row">
        <input className="invite-friends-input" readOnly value={referralLink} onFocus={e => e.target.select()} />
        <button className="invite-friends-copy-btn" onClick={copyReferralLink}>
          <Icon name="copy" size={15} /> Copy
        </button>
      </div>
    </div>

    <button className="profile-danger-btn" onClick={() => setShowDeleteConfirm(true)}>
      Delete Account
    </button>

    {showDeleteConfirm && (
      <div className="auth-overlay active" onClick={e => e.target.classList.contains('auth-overlay') && setShowDeleteConfirm(false)}>
        <div className="auth-modal" style={{ textAlign: 'left' }}>
          <h3 style={{ marginBottom: 12 }}>Delete your account?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
            This permanently deletes your profile, streak, vocabulary, and call history. This can't be undone.
          </p>
          <div className="profile-edit-actions">
            <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            <button className="btn-primary" style={{ background: '#dc2626' }} onClick={handleDeleteAccount}>
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}

      <div className={`profile-toast${toast ? ' show' : ''}`}>{toast}</div>
      <BottomNav />
    </div>
  );
}