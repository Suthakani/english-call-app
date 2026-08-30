import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig.js';
import BottomNav from '../components/BottomNav.jsx';
import '../winners.css';

const avatarFor = row =>
  row.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.username || 'U')}`;

const formatDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function Winners() {
  const navigate = useNavigate();
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/leaderboard/winners')
      .then(({ data }) => { if (active) setWinners(data); })
      .catch(err => { if (active) setError(err.response?.data?.message || 'Could not load winners.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="winners-page">
      <div className="winners-bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="winners-container">
        <button className="winners-back" onClick={() => navigate('/leaderboard')}>← Back to Leaderboard</button>

        <div className="winners-header">
          <div className="winners-header-icon">🏆</div>
          <h1>Hall of Champions</h1>
          <p>One winner is crowned every 10 days — could you be next?</p>
        </div>

        {loading && <div className="winners-loading">Loading champions…</div>}
        {!loading && error && <div className="winners-error">{error}</div>}

        {!loading && !error && (
          winners.length === 0 ? (
            <p className="winners-empty">No champion has been crowned yet — the first 10-day cycle is still in progress.</p>
          ) : (
            <div className="winners-list">
              {winners.map(w => (
                <div className="winner-card" key={w.cycleIndex}>
                  <img className="winner-card-avatar" src={avatarFor(w)} alt="" />
                  <div className="winner-card-info">
                    <div className="winner-card-name">{w.username}</div>
                    <div className="winner-card-period">{formatDate(w.cycleStart)} – {formatDate(w.cycleEnd)}</div>
                  </div>
                  <div className="winner-card-points">
                    <span className="winner-card-points-num">{w.points}</span>
                    <span className="winner-card-points-label">points</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <BottomNav />
    </div>
  );
}