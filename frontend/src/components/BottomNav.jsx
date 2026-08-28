import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// App-style bottom tab bar. Only shows for logged-in users (all its
// destinations are protected routes), and only renders on mobile widths —
// desktop already has the top navbar for these same destinations.
//
// NOTE: "Learn" and "Practice" both used to point at /categories, and
// "Progress"/"Profile" both pointed at /profile — four tabs, two real
// destinations. Practice now jumps straight into whatever category the
// user last practiced (same "continue where you left off" idea as the
// homepage banner), falling back to /categories only if they've never
// practiced yet — so it's a genuinely different action from browsing Learn.
const TABS = [
  { path: '/', label: 'Home', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z M9 22V12h6v10' },
  { path: '/categories', label: 'Learn', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z' },
  { path: '__practice__', label: 'Practice', icon: 'mic', isPrimary: true },
  { path: '/profile?tab=progress', label: 'Progress', icon: 'M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3' },
  { path: '/profile', label: 'Profile', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z' },
];

const TabIcon = ({ icon }) => {
  if (icon === 'mic') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={icon} />
    </svg>
  );
};

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const goToTab = path => {
    if (path === '__practice__') {
      // Jump straight back into the last category the user practiced —
      // mirrors the homepage's "Continue where you left off" banner.
      // If they've never practiced yet, there's nothing to jump back into,
      // so send them to Learn instead.
      const lastSlug = localStorage.getItem('lastCategorySlug');
      navigate(lastSlug ? `/call/${lastSlug}` : '/categories');
      return;
    }
    navigate(path);
  };

  // Active-state matching: Progress and Profile share the /profile path but
  // differ by ?tab=, so compare pathname+search rather than pathname alone.
  const isActive = tabPath => {
    if (tabPath === '__practice__') return false; // never shown "active" — it's a jump action, not a destination you stay on
    const [tabPathname, tabQuery] = tabPath.split('?');
    if (location.pathname !== tabPathname) return false;
    if (!tabQuery) return !location.search; // plain /profile is active only when there's no ?tab=
    return location.search.includes(tabQuery);
  };

  return (
    <nav className="bottom-nav">
      {TABS.map((tab, i) => {
        const active = isActive(tab.path);
        return (
          <button
            key={i}
            className={`bottom-nav-item${active ? ' active' : ''}${tab.isPrimary ? ' primary' : ''}`}
            onClick={() => goToTab(tab.path)}
          >
            <span className="bottom-nav-icon"><TabIcon icon={tab.icon} /></span>
            <span className="bottom-nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}