import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig.js';
import './pendingMatches.css';

export default function PendingMatches() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState([]); // up to 2 request IDs
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/match/admin/pending')
      .then(({ data }) => setRequests(data.requests))
      .catch(() => setToast('Could not load requests'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleSelect = id => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id]; // keep last 2 picked
      return [...prev, id];
    });
  };

  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handlePair = async () => {
    if (selected.length !== 2) return;
    setActionLoading(true);
    try {
      await api.post('/match/admin/approve-pair', {
        requestIdA: selected[0],
        requestIdB: selected[1],
      });
      showToast('Paired successfully!');
      setSelected([]);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not pair');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async id => {
    try {
      await api.post(`/match/admin/reject/${id}`);
      setSelected(prev => prev.filter(x => x !== id));
      load();
    } catch {
      showToast('Could not reject');
    }
  };

  const timeAgo = dateStr => {
    const mins = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="pm-wrap">
      <div className="pm-header">
        <h2>Pending Match Requests</h2>
        <p>Select two compatible requests, then pair them into a session.</p>
      </div>

      {selected.length > 0 && (
        <div className="pm-selection-bar">
          <span>{selected.length}/2 selected</span>
          <button
            className="btn-primary"
            disabled={selected.length !== 2 || actionLoading}
            onClick={handlePair}
          >
            {actionLoading ? 'Pairing…' : 'Pair Selected'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="pm-empty">Loading…</div>
      ) : requests.length === 0 ? (
        <div className="pm-empty">No pending requests right now.</div>
      ) : (
        <div className="pm-list">
          {requests.map(r => (
            <div
              key={r._id}
              className={`pm-row${selected.includes(r._id) ? ' pm-row-selected' : ''}`}
              onClick={() => toggleSelect(r._id)}
            >
              <div className="pm-row-user">
                <div className="pm-avatar">{r.user?.username?.[0]?.toUpperCase() || '?'}</div>
                <div>
                  <div className="pm-username">{r.user?.username || 'Unknown'}</div>
                  <div className="pm-email">{r.user?.email}</div>
                </div>
              </div>
              <div className="pm-tag pm-level">{r.level}</div>
              <div className="pm-tag pm-mode">{r.mode}</div>
              <div className="pm-time">{timeAgo(r.createdAt)}</div>
              <button
                className="pm-reject-btn"
                onClick={e => { e.stopPropagation(); handleReject(r._id); }}
              >
                Reject
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={`pm-toast${toast ? ' show' : ''}`}>{toast}</div>
    </div>
  );
}