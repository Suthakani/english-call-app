import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig.js';
import { useAuth } from '../context/AuthContext.jsx';
import DpIcon from './DpIcon.jsx';

/**
 * Drop this into any detail page:
 *   <QnASection pageSlug="streak" />
 *
 * Backend contract expected (add these routes):
 *   GET    /qna/:pageSlug                -> { questions: [Question] }
 *   POST   /qna/:pageSlug                -> { question: Question }   body: { question }
 *   POST   /qna/:pageSlug/:questionId/reply -> { reply: Reply }      body: { reply }
 *
 * Question = { _id, question, username, userId, createdAt, replies: [Reply] }
 * Reply    = { reply, username, userId, isAdmin, createdAt }
 *
 * isAdmin on a reply should be set SERVER-SIDE from req.user.role === 'admin',
 * never trust a flag sent from the client for this.
 */
export default function QnASection({ pageSlug }) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [posting, setPosting] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyingId, setReplyingId] = useState(null);
  const [sendingReply, setSendingReply] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/qna/${pageSlug}`)
      .then(({ data }) => { if (!cancelled) setQuestions(data.questions || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pageSlug]);

  const handleAsk = async e => {
    e.preventDefault();
    if (!user || !newQuestion.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post(`/qna/${pageSlug}`, { question: newQuestion.trim() });
      setQuestions(prev => [data.question, ...prev]);
      setNewQuestion('');
    } catch (err) {
      // silent fail is fine here since this is a nice-to-have widget;
      // wire this into your existing toast system if you want feedback
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async questionId => {
    const text = (replyDrafts[questionId] || '').trim();
    if (!text || !user) return;
    setSendingReply(questionId);
    try {
      const { data } = await api.post(`/qna/${pageSlug}/${questionId}/reply`, { reply: text });
      setQuestions(prev =>
        prev.map(q => (q._id === questionId ? { ...q, replies: [...(q.replies || []), data.reply] } : q))
      );
      setReplyDrafts(prev => ({ ...prev, [questionId]: '' }));
      setReplyingId(null);
    } catch (err) {
      // same note as above
    } finally {
      setSendingReply(null);
    }
  };

  return (
    <section className="dp-qna">
      <div className="dp-section-head">
        <h2>Questions from learners</h2>
        <p>Ask anything about this — our team or fellow learners will help.</p>
      </div>

      {user ? (
        <form className="dp-qna-ask-form" onSubmit={handleAsk}>
          <textarea
            className="dp-qna-input"
            placeholder="Type your question here..."
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            rows={2}
          />
          <button className="dp-btn dp-btn-primary" type="submit" disabled={posting || !newQuestion.trim()}>
            {posting ? 'Posting...' : 'Ask'}
          </button>
        </form>
      ) : (
        <p className="dp-qna-login-hint">Log in to ask a question or reply.</p>
      )}

      {loading ? (
        <p className="dp-qna-loading">Loading questions...</p>
      ) : questions.length === 0 ? (
        <p className="dp-qna-empty">No questions yet — be the first to ask!</p>
      ) : (
        <div className="dp-qna-list">
          {questions.map(q => {
            // Admin replies float to the top so the "official" answer is
            // always the first thing visible under a question.
            const sortedReplies = [...(q.replies || [])].sort(
              (a, b) => (b.isAdmin ? 1 : 0) - (a.isAdmin ? 1 : 0)
            );
            return (
              <div className="dp-qna-item" key={q._id}>
                <div className="dp-qna-question">
                  <div className="dp-qna-avatar">{(q.username || '?')[0].toUpperCase()}</div>
                  <div>
                    <div className="dp-qna-question-text">{q.question}</div>
                    <div className="dp-qna-meta">{q.username}</div>
                  </div>
                </div>

                {sortedReplies.length > 0 && (
                  <div className="dp-qna-replies">
                    {sortedReplies.map((r, i) => (
                      <div className={`dp-qna-reply${r.isAdmin ? ' dp-qna-reply-admin' : ''}`} key={i}>
                        {r.isAdmin && (
                          <span className="dp-qna-admin-tag">
                            <DpIcon name="shield-check" size={12} /> Official Answer
                          </span>
                        )}
                        <div className="dp-qna-reply-text">{r.reply}</div>
                        <div className="dp-qna-meta">{r.username}</div>
                      </div>
                    ))}
                  </div>
                )}

                {user && (
                  replyingId === q._id ? (
                    <div className="dp-qna-reply-form">
                      <textarea
                        className="dp-qna-input"
                        rows={2}
                        placeholder="Write a reply..."
                        value={replyDrafts[q._id] || ''}
                        onChange={e => setReplyDrafts(prev => ({ ...prev, [q._id]: e.target.value }))}
                      />
                      <div className="dp-qna-reply-actions">
                        <button
                          className="dp-btn dp-btn-primary"
                          onClick={() => handleReply(q._id)}
                          disabled={sendingReply === q._id || !(replyDrafts[q._id] || '').trim()}
                        >
                          {sendingReply === q._id ? 'Sending...' : 'Send'}
                        </button>
                        <button className="dp-btn dp-btn-ghost" onClick={() => setReplyingId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="dp-qna-reply-toggle" onClick={() => setReplyingId(q._id)}>
                      Reply
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}