import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig.js';
import { useAuth } from '../context/AuthContext.jsx';
import { connectSocket, getSocket } from '../socket.js';
import './findPartner.css';

const modeOptions = [
  { value: 'text', label: 'Text', icon: '💬' },
  { value: 'voice', label: 'Voice', icon: '🎙️' },
  { value: 'both', label: 'Both', icon: '🎧' },
];

export default function FindPartner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('both');
  const [sendingTo, setSendingTo] = useState(null); // userId currently sending
  const [pendingRequestId, setPendingRequestId] = useState(null); // request I sent, awaiting response
  const [pendingToUsername, setPendingToUsername] = useState('');
  const [incomingInvite, setIncomingInvite] = useState(null); // { requestId, fromUser, mode }
  const [toast, setToast] = useState('');

  const loadUsers = () => {
    api.get('/match/online-users')
      .then(({ data }) => setUsers(data.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket(user._id || user.id);

    const onPresence = ({ userId, online }) => {
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, online } : u));
    };

    const onInviteReceived = ({ requestId, fromUser, mode }) => {
      setIncomingInvite({ requestId, fromUser, mode });
    };

    const onInviteDeclined = () => {
      setPendingRequestId(null);
      setPendingToUsername('');
      showToast('They declined this time — try someone else.');
    };

    const onInviteCancelled = () => {
      setIncomingInvite(null);
    };

    const onMatchFound = ({ sessionId, mode }) => {
      navigate(`/practice-call/${sessionId}`, { state: { mode } });
    };

    socket.on('presence:update', onPresence);
    socket.on('partner:invite', onInviteReceived);
    socket.on('partner:invite-declined', onInviteDeclined);
    socket.on('partner:invite-cancelled', onInviteCancelled);
    socket.on('match:found', onMatchFound);

    return () => {
      socket.off('presence:update', onPresence);
      socket.off('partner:invite', onInviteReceived);
      socket.off('partner:invite-declined', onInviteDeclined);
      socket.off('partner:invite-cancelled', onInviteCancelled);
      socket.off('match:found', onMatchFound);
    };
  }, [user, navigate]);

  const sendInvite = async (toUser) => {
    setSendingTo(toUser._id);
    try {
      const { data } = await api.post('/match/invite', { toUserId: toUser._id, mode });
      setPendingRequestId(data.request._id);
      setPendingToUsername(toUser.username);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not send invite');
    } finally {
      setSendingTo(null);
    }
  };

  const cancelInvite = async () => {
    if (!pendingRequestId) return;
    try {
      await api.post(`/match/invite/${pendingRequestId}/cancel`);
    } catch {}
    setPendingRequestId(null);
    setPendingToUsername('');
  };

  const respondToInvite = async (accept) => {
    if (!incomingInvite) return;
    try {
      await api.post(`/match/invite/${incomingInvite.requestId}/respond`, { accept });
      if (!accept) setIncomingInvite(null);
      // On accept, match:found event will fire and navigate automatically
    } catch (err) {
      showToast('Could not respond to invite');
      setIncomingInvite(null);
    }
  };

  const onlineUsers = users.filter(u => u.online);
  const offlineUsers = users.filter(u => !u.online);

  return (
    <div className="fp-page">
      <div className="fp-card">
        <button className="fp-back" onClick={() => navigate(-1)}>← Back</button>
        <h2 className="fp-title">Find a Practice Partner</h2>
        <p className="fp-desc">Pick someone online and send them a practice invite.</p>

        <div className="fp-mode-row">
          {modeOptions.map(o => (
            <button
              key={o.value}
              className={`fp-mode-chip${mode === o.value ? ' active' : ''}`}
              onClick={() => setMode(o.value)}
            >
              {o.icon} {o.label}
            </button>
          ))}
        </div>

        {pendingRequestId && (
          <div className="fp-pending-banner">
            <div className="fp-pending-spinner"></div>
            <span>Waiting for <strong>{pendingToUsername}</strong> to respond…</span>
            <button className="fp-pending-cancel" onClick={cancelInvite}>Cancel</button>
          </div>
        )}

        {loading ? (
          <div className="fp-empty">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="fp-empty">No other users yet.</div>
        ) : (
          <div className="fp-user-list">
            {onlineUsers.length > 0 && (
              <>
                <div className="fp-list-label">Online — {onlineUsers.length}</div>
                {onlineUsers.map(u => (
                  <div className="fp-user-row" key={u._id}>
                    <div className="fp-user-left">
                      <span className="fp-status-dot online"></span>
                      <div className="fp-avatar">{u.username?.[0]?.toUpperCase()}</div>
                      <div>
                        <div className="fp-username">{u.username}</div>
                        <div className="fp-level">{u.level}</div>
                      </div>
                    </div>
                    <button
                      className="fp-invite-btn"
                      onClick={() => sendInvite(u)}
                      disabled={sendingTo === u._id || !!pendingRequestId}
                    >
                      {sendingTo === u._id ? 'Sending…' : 'Invite'}
                    </button>
                  </div>
                ))}
              </>
            )}

            {offlineUsers.length > 0 && (
              <>
                <div className="fp-list-label">Offline — {offlineUsers.length}</div>
                {offlineUsers.map(u => (
                  <div className="fp-user-row offline" key={u._id}>
                    <div className="fp-user-left">
                      <span className="fp-status-dot"></span>
                      <div className="fp-avatar muted">{u.username?.[0]?.toUpperCase()}</div>
                      <div>
                        <div className="fp-username">{u.username}</div>
                        <div className="fp-level">{u.level}</div>
                      </div>
                    </div>
                    <span className="fp-offline-label">Offline</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {incomingInvite && (
        <div className="fp-invite-overlay">
          <div className="fp-invite-modal">
            <div className="fp-invite-avatar">{incomingInvite.fromUser.username?.[0]?.toUpperCase()}</div>
            <h3>{incomingInvite.fromUser.username} wants to practice with you</h3>
            <p className="fp-invite-mode">Mode: {incomingInvite.mode}</p>
            <div className="fp-invite-actions">
              <button className="fp-decline-btn" onClick={() => respondToInvite(false)}>Decline</button>
              <button className="btn-primary" onClick={() => respondToInvite(true)}>Accept</button>
            </div>
          </div>
        </div>
      )}

      <div className={`fp-toast${toast ? ' show' : ''}`}>{toast}</div>
    </div>
  );
}