import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import './ShareCardModal.css';

// Two shareable card designs — Streak and Badges. The user picks which
// one to generate, we render it off-screen with brand styling, then
// snapshot it to a PNG via html2canvas (same approach as Certificate.jsx)
// so it can be downloaded or shared to WhatsApp/Instagram etc.
export default function ShareCardModal({ user, streakDays, longestStreak, badges, onClose }) {
  const [cardType, setCardType] = useState(null); // null | 'streak' | 'badges'
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef(null);

  const earnedBadges = badges.filter(b => b.earned);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png');

      // Prefer the native share sheet on mobile (lets them pick
      // WhatsApp/Instagram/etc directly); fall back to a plain download.
      if (navigator.canShare && navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'speakup-share.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My SpeakUp progress',
            text: cardType === 'streak'
              ? `I'm on a ${streakDays}-day English speaking streak on SpeakUp! 🔥`
              : `I just earned ${earnedBadges.length} badges on SpeakUp! 🏅`,
          });
          setGenerating(false);
          return;
        }
      }

      const link = document.createElement('a');
      link.download = `speakup-${cardType}-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate share card:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="share-modal-overlay" onClick={e => e.target.classList.contains('share-modal-overlay') && onClose()}>
      <div className="share-modal">
        <button className="share-modal-close" onClick={onClose}>✕</button>

        {!cardType ? (
          <>
            <h3 className="share-modal-title">Share your progress</h3>
            <p className="share-modal-sub">Pick a card to share with friends</p>
            <div className="share-modal-options">
              <button className="share-option-btn" onClick={() => setCardType('streak')}>
                <span className="share-option-icon">🔥</span>
                <span>Streak Card</span>
              </button>
              <button
                className="share-option-btn"
                onClick={() => setCardType('badges')}
                disabled={earnedBadges.length === 0}
              >
                <span className="share-option-icon">🏅</span>
                <span>Badges Card</span>
                {earnedBadges.length === 0 && <span className="share-option-hint">Earn a badge first</span>}
              </button>
            </div>
          </>
        ) : (
          <>
            <button className="share-modal-back" onClick={() => setCardType(null)}>← Back</button>

            <div className="share-card-preview-wrap">
              {cardType === 'streak' ? (
                <div className="share-card share-card-streak" ref={cardRef}>
                  <div className="share-card-brand">🎙️ SpeakUp</div>
                  <div className="share-card-flame">🔥</div>
                  <div className="share-card-num">{streakDays}</div>
                  <div className="share-card-label">DAY STREAK</div>
                  <div className="share-card-user">{user?.username}</div>
                  {longestStreak > streakDays && (
                    <div className="share-card-sub">Personal best: {longestStreak} days</div>
                  )}
                </div>
              ) : (
                <div className="share-card share-card-badges" ref={cardRef}>
                  <div className="share-card-brand">🎙️ SpeakUp</div>
                  <div className="share-card-badges-num">{earnedBadges.length}</div>
                  <div className="share-card-label">BADGES EARNED</div>
                  <div className="share-card-badge-row">
                    {earnedBadges.slice(0, 5).map(b => (
                      <span key={b.slug} className="share-card-badge-emoji">🏅</span>
                    ))}
                  </div>
                  <div className="share-card-user">{user?.username}</div>
                </div>
              )}
            </div>

            <button className="share-download-btn" onClick={handleDownload} disabled={generating}>
              {generating ? 'Preparing…' : '⬇ Download & Share'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}