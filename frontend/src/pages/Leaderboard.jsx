import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig.js';
import { useAuth } from '../context/AuthContext.jsx';
import './leaderboard.css';
import BottomNav from '../components/BottomNav.jsx';

const ICON_PATHS = {
  'arrow-left': '<line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  crown: '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z"/>',
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

const avatarFor = row =>
  row.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.username || 'U')}`;

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [you, setYou] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/leaderboard?limit=20')
      .then(({ data }) => {
        if (!active) return;
        setLeaderboard(data.leaderboard || []);
        setYou(data.you || null);
      })
      .catch(err => {
        if (!active) return;
        setError(err.response?.data?.message || 'Could not load the leaderboard.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <button className="leaderboard-back" onClick={() => navigate('/profile')}>
        <Icon name="arrow-left" size={16} /> Back to Profile
      </button>
<button className="leaderboard-back" onClick={() => navigate('/winners')} style={{ marginLeft: 10 }}>
  🏆 Hall of Champions
</button>
      <div className="leaderboard-header">
        <div className="leaderboard-header-icon"><Icon name="trophy" size={26} /></div>
        <h1>Leaderboard</h1>
        <p>See how your streak stacks up against other learners.</p>
      </div>

      {loading && <div className="leaderboard-loading">Loading rankings…</div>}
      {!loading && error && <div className="leaderboard-error">{error}</div>}

      {!loading && !error && (
        <>
          {top3.length > 0 && (
            <div className="leaderboard-podium">
              {/* Rendered in visual order 2nd–1st–3rd so the winner sits tallest in the middle */}
              {[top3[1], top3[0], top3[2]].map((row, i) =>
                row ? (
                  <div className={`podium-card podium-rank-${row.rank}${row.isYou ? ' podium-you' : ''}`} key={row.userId}>
                    {row.rank === 1 && <div className="podium-crown"><Icon name="crown" size={20} /></div>}
                    <img className="podium-avatar" src={avatarFor(row)} alt="" />
                    <div className="podium-name">{row.username}{row.isYou ? ' (You)' : ''}</div>
                    <div className="podium-streak"><Icon name="flame" size={14} /> {row.streakDays}</div>
<div className="podium-points">⭐ {row.points ?? 0} pts</div>
                  </div>
                ) : <div className="podium-card podium-empty" key={`empty-${i}`} />
              )}
            </div>
          )}

          <div className="leaderboard-list">
            {rest.length === 0 && top3.length === 0 && (
              <p className="leaderboard-empty">No ranked learners yet — be the first to start a streak!</p>
            )}
            {rest.map(row => (
              <div className={`leaderboard-row${row.isYou ? ' leaderboard-row-you' : ''}`} key={row.userId}>
                <span className="leaderboard-rank">#{row.rank}</span>
                <img className="leaderboard-row-avatar" src={avatarFor(row)} alt="" />
                <span className="leaderboard-row-name">{row.username}{row.isYou ? ' (You)' : ''}</span>
                <span className="leaderboard-row-streak"><Icon name="flame" size={14} /> {row.streakDays}</span>
              </div>
            ))}
          </div>

          {you && you.outsideTop && (
            <div className="leaderboard-you-sticky">
              <span className="leaderboard-rank">#{you.rank}</span>
              <img className="leaderboard-row-avatar" src={avatarFor(you)} alt="" />
              <span className="leaderboard-row-name">{you.username} (You)</span>
              <span className="leaderboard-row-streak"><Icon name="flame" size={14} /> {you.streakDays}</span>
            </div>
          )}
        </>
      )}

      <BottomNav />
    </div>
  );
}