import { useState, useEffect } from 'react';
import api from '../api/axiosConfig.js';

// Checks once (on mount) whether the current user just won the previous
// 10-day competition cycle, and shows a celebratory modal if so. Mount
// this once near the top of the app (e.g. in Home page or a layout
// component that renders on every route) so it fires on the user's next
// login/visit after winning.
export default function WinnerPopup() {
  const [data, setData] = useState(null); // null = not checked / nothing to show

  useEffect(() => {
    let active = true;
    api.get('/leaderboard/winner-popup')
      .then(({ data }) => {
        if (!active) return;
        if (data.show) setData(data);
      })
      .catch(err => console.error('Failed to check winner popup:', err));
    return () => { active = false; };
  }, []);

  const dismiss = async () => {
    setData(null);
    try {
      await api.post('/leaderboard/winner-popup/seen');
    } catch (err) {
      console.error('Failed to mark winner popup as seen:', err);
    }
  };

  if (!data) return null;

  const formatDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="winner-popup-overlay" onClick={e => e.target.classList.contains('winner-popup-overlay') && dismiss()}>
      <div className="winner-popup-modal">
        <div className="winner-popup-confetti">🎉</div>
        <div className="winner-popup-trophy">🏆</div>
        <h2>You're the Champion!</h2>
        <p className="winner-popup-sub">
          You topped the leaderboard for {formatDate(data.cycleStart)} – {formatDate(data.cycleEnd)}
          {' '}with <strong>{data.points} points</strong>.
        </p>

        <div className="winner-popup-rewards">
          <div className="winner-popup-reward">
            <span className="winner-popup-reward-icon">❄️</span>
            <span>+{data.rewards.streakFreezes} Streak Freezes</span>
          </div>
          <div className="winner-popup-reward">
            <span className="winner-popup-reward-icon">🥇</span>
            <span>Champion Badge unlocked</span>
          </div>
          {data.rewards.certificateEligible && (
            <div className="winner-popup-reward">
              <span className="winner-popup-reward-icon">📜</span>
              <span>Certificate available</span>
            </div>
          )}
        </div>

        <button className="winner-popup-close-btn" onClick={dismiss}>Awesome, thanks!</button>
      </div>
    </div>
  );
}