import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";

const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "categories", label: "Categories", icon: "📚" },
  { id: "atrisk", label: "At Risk", icon: "⚠️" },
  { id: "engagement", label: "Engagement", icon: "🔥" },
  { id: "insights", label: "Insights", icon: "🧠" },
  { id: "messages", label: "Messages", icon: "✉️" },
];

// Converts the users array to a CSV string and triggers a browser download.
// No library needed — Excel/Sheets open plain CSV fine.
function downloadUsersCSV(users) {
  const headers = ["Username", "Email", "Streak", "Sessions", "Points", "Level", "Joined"];
const rows = users.map((u) => [
  u.username,
  u.email,
  u.streakDays,
  u.totalSessions,
  u.points ?? 0,
  u.level,
  new Date(u.createdAt).toLocaleDateString(),
]);
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `speakup-users-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const [levelDist, setLevelDist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [reminderStatus, setReminderStatus] = useState({}); // { [userId]: 'sending' | 'sent' | 'error' }
const [bulkSending, setBulkSending] = useState(false);
  // ── New data: engagement + insights + messages ──
  const [challengeStats, setChallengeStats] = useState(null);
  const [dauTrend, setDauTrend] = useState([]);
  const [vocabStats, setVocabStats] = useState(null);
  const [levelTestStats, setLevelTestStats] = useState(null);
  const [languageBreakdown, setLanguageBreakdown] = useState([]);
  const [loginSplit, setLoginSplit] = useState(null);
  const [contactSubs, setContactSubs] = useState([]);
  const [extrasLoading, setExtrasLoading] = useState(true);
  const [extrasError, setExtrasError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/admin/overview"),
      api.get("/admin/users?limit=50&sortBy=streakDays"),
      api.get("/admin/category-popularity"),
      api.get("/admin/at-risk"),
      api.get("/admin/level-distribution"),
    ])
      .then(([overviewRes, usersRes, categoryRes, atRiskRes, levelRes]) => {
        setOverview(overviewRes.data);
        setUsers(usersRes.data.users);
        setCategoryStats(categoryRes.data);
        setAtRisk(atRiskRes.data);
        setLevelDist(levelRes.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load admin data");
        setLoading(false);
      });

    // Kept as a separate Promise.all so that if these newer endpoints
    // aren't deployed yet, the core dashboard above still loads fine.
    Promise.all([
      api.get("/admin/challenge-stats"),
      api.get("/admin/dau-trend"),
      api.get("/admin/vocab-stats"),
      api.get("/admin/level-test-stats"),
      api.get("/admin/language-breakdown"),
      api.get("/admin/login-method-split"),
      api.get("/admin/contact-submissions"),
    ])
      .then(([challengeRes, dauRes, vocabRes, levelTestRes, langRes, loginRes, contactRes]) => {
        setChallengeStats(challengeRes.data);
        setDauTrend(dauRes.data);
        setVocabStats(vocabRes.data);
        setLevelTestStats(levelTestRes.data);
        setLanguageBreakdown(langRes.data);
        setLoginSplit(loginRes.data);
        setContactSubs(contactRes.data);
        setExtrasLoading(false);
      })
      .catch((err) => {
        setExtrasError(err.response?.data?.message || "Failed to load extended stats");
        setExtrasLoading(false);
      });
  }, []);

  // Search runs against the already-loaded users list client-side — the
  // dataset is small (≤50), so a fresh request per keystroke isn't worth it.
  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const markContactResolved = (id) => {
    api
      .patch(`/admin/contact-submissions/${id}`, { status: "resolved" })
      .then(() => {
        setContactSubs((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: "resolved" } : c))
        );
      })
      .catch(() => {});
  };
    const sendReminder = (userId) => {
    setReminderStatus((prev) => ({ ...prev, [userId]: "sending" }));
    api
      .post(`/admin/send-reminder/${userId}`)
      .then(() => {
        setReminderStatus((prev) => ({ ...prev, [userId]: "sent" }));
        setAtRisk((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, lastReminderSentAt: new Date().toISOString() } : u))
        );
      })
      .catch((err) => {
        setReminderStatus((prev) => ({ ...prev, [userId]: "error" }));
        alert(err.response?.data?.message || "Could not send reminder");
      });
  };

  const sendBulkReminders = () => {
    if (atRisk.length === 0) return;
    setBulkSending(true);
    api
      .post("/admin/send-reminders-bulk", { userIds: atRisk.map((u) => u._id) })
      .then(({ data }) => {
        alert(`Sent: ${data.sent}, Skipped (recently sent): ${data.skipped}`);
        const now = new Date().toISOString();
        setAtRisk((prev) => prev.map((u) => ({ ...u, lastReminderSentAt: now })));
      })
      .catch(() => alert("Bulk send failed"))
      .finally(() => setBulkSending(false));
  };

  const reminderCooldownActive = (lastSentAt) => {
    if (!lastSentAt) return false;
    const hoursSince = (Date.now() - new Date(lastSentAt).getTime()) / (1000 * 60 * 60);
    return hoursSince < 24;
  };
  return (
    <div className="admin-page">
      <div className="admin-bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="admin-topbar">
        <div className="admin-brand" onClick={() => navigate("/")}>
          <div className="admin-brand-icon">📊</div>
          SpeakUp <span>Admin</span>
        </div>
        <button className="admin-home-btn" onClick={() => navigate("/")}>← Back to Site</button>
      </div>

      {loading ? (
        <div className="admin-center">Loading admin dashboard...</div>
      ) : error ? (
        <div className="admin-center admin-error">Error: {error}</div>
      ) : (
        <div className="admin-content">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">A live look at how learners are using SpeakUp.</p>

          <div className="admin-tabbar">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`admin-tab${activeTab === t.id ? " active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                <span>{t.icon}</span> {t.label}
                {t.id === "atrisk" && atRisk.length > 0 && (
                  <span className="admin-tab-badge">{atRisk.length}</span>
                )}
                {t.id === "messages" && contactSubs.filter((c) => c.status !== "resolved").length > 0 && (
                  <span className="admin-tab-badge">
                    {contactSubs.filter((c) => c.status !== "resolved").length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="admin-tab-panel">
              {users.length > 0 && (() => {
  const top = [...users].sort((a, b) => b.streakDays - a.streakDays)[0];
  return (
    <div className="admin-spotlight">
      <div className="admin-spotlight-avatar">{initials(top.username)}</div>
      <div className="admin-spotlight-body">
        <div className="admin-spotlight-tag">🏆 Top Performer</div>
        <div className="admin-spotlight-name">{top.username}</div>
        <div className="admin-spotlight-sub">{top.totalSessions} sessions · {top.level}</div>
      </div>
      <div className="admin-spotlight-streak">
        <div className="admin-spotlight-streak-num">{top.streakDays} 🔥</div>
        <div className="admin-spotlight-streak-label">day streak</div>
      </div>
    </div>
  );
})()}
              <div className="admin-card-grid">
                <StatCard label="Total Users" value={overview.totalUsers} icon="👥" />
                <StatCard label="Active Today" value={overview.activeToday} icon="🟢" />
                <StatCard label="New This Week" value={overview.newSignupsThisWeek} icon="✨" />
                <StatCard label="Avg Streak (days)" value={overview.avgStreak} icon="🔥" />
                <StatCard label="Avg Sessions / User" value={overview.avgSessions} icon="📞" />
                <StatCard label="Total Learning Time" value={`${overview.totalMinutesSpent} min`} icon="⏱️" />
              </div>

              <h2 className="admin-section-title" style={{ marginTop: 32 }}>Level Distribution</h2>
              <LevelBar data={levelDist} />
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === "users" && (
            <div className="admin-tab-panel">
              <div className="admin-panel-header">
                <h2 className="admin-section-title">All Users (by streak)</h2>
                <div className="admin-panel-actions">
                  <input
                    className="admin-search-input"
                    type="text"
                    placeholder="Search by username or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="admin-export-btn" onClick={() => downloadUsersCSV(filteredUsers)}>
                    ⬇ Export CSV
                  </button>
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="admin-empty">No users match "{search}"</div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Streak</th>
                        <th>Sessions</th>
                        <th>Points</th>
                        <th>Level</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr
                          key={u._id}
                          className="admin-row-clickable"
                          onClick={() => setSelectedUserId(u._id)}
                        >
                          <td className="admin-table-highlight">
  <div className="admin-avatar-cell">
    <span className="admin-mini-avatar">{initials(u.username)}</span>
    {u.username}
  </div>
</td>
                          <td>{u.email}</td>
                          <td>{u.streakDays} 🔥</td>
                          <td>{u.totalSessions}</td>
                          <td>{u.points ?? 0} ⭐</td>
                          <td><span className="admin-level-pill">{u.level}</span></td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── CATEGORIES ── */}
          {activeTab === "categories" && (
            <div className="admin-tab-panel">
              <h2 className="admin-section-title">Most Practiced Categories</h2>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Total Turns</th>
                      <th>Users Practicing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryStats.map((cat) => (
  <tr key={cat._id}>
    <td className="admin-table-highlight">
      <div className="admin-category-cell">
        <span className="admin-category-icon">{CATEGORY_ICONS[cat._id] || "📚"}</span>
        {cat._id}
      </div>
    </td>
    <td>{cat.totalTurns}</td>
    <td>{cat.userCount}</td>
  </tr>
))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

                    {/* ── AT RISK ── */}
          {activeTab === "atrisk" && (
            <div className="admin-tab-panel">
              <div className="admin-panel-header">
                <div>
                  <h2 className="admin-section-title">At-Risk Users</h2>
                  <p className="admin-panel-desc">
                    Users who practiced before but haven't shown up in 3+ days — good candidates for a nudge.
                  </p>
                </div>
                {atRisk.length > 0 && (
                  <button className="admin-export-btn" onClick={sendBulkReminders} disabled={bulkSending}>
                    {bulkSending ? "Sending…" : `✉ Send Reminder to All (${atRisk.length})`}
                  </button>
                )}
              </div>
              {atRisk.length === 0 ? (
                <div className="admin-empty">🎉 No at-risk users right now — everyone's engaged!</div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Days Inactive</th>
                        <th>Last Streak</th>
                        <th>Total Sessions</th>
                        <th>Level</th>
                        <th>Reminder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atRisk.map((u) => {
                        const status = reminderStatus[u._id];
                        const onCooldown = reminderCooldownActive(u.lastReminderSentAt);
                        return (
                          <tr key={u._id}>
                            <td className="admin-table-highlight">{u.username}</td>
                            <td>{u.email}</td>
                            <td><span className="admin-risk-pill">{u.daysInactive}d ago</span></td>
                            <td>{u.streakDays} 🔥</td>
                            <td>{u.totalSessions}</td>
                            <td><span className="admin-level-pill">{u.level}</span></td>
                            <td>
                              {status === "sent" || onCooldown ? (
                                <span className="admin-level-pill">✓ Sent</span>
                              ) : (
                                <button
                                  className="admin-export-btn"
                                  onClick={() => sendReminder(u._id)}
                                  disabled={status === "sending"}
                                >
                                  {status === "sending" ? "Sending…" : "✉ Remind"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── ENGAGEMENT: Daily Challenge stats + DAU trend ── */}
          {activeTab === "engagement" && (
            <div className="admin-tab-panel">
              {extrasLoading ? (
                <div className="admin-empty">Loading engagement data...</div>
              ) : extrasError ? (
                <div className="admin-empty admin-error">{extrasError}</div>
              ) : (
                <>
                  <h2 className="admin-section-title">Daily Challenge</h2>
                  <div className="admin-card-grid" style={{ marginBottom: 32 }}>
                    <StatCard label="Completion Rate" value={`${challengeStats?.completionRate ?? 0}%`} icon="✅" />
                    <StatCard label="Avg Score" value={challengeStats?.avgScore ?? 0} icon="⭐" />
                    <StatCard label="Badge Award Rate" value={`${challengeStats?.badgeRate ?? 0}%`} icon="🏅" />
                  </div>

                  <h2 className="admin-section-title">Challenge Completions (last 14 days)</h2>
                  <MiniBarTrend data={challengeStats?.dailyTrend || []} valueKey="completions" />

                  <h2 className="admin-section-title" style={{ marginTop: 32 }}>Daily Active Users</h2>
                  <MiniBarTrend data={dauTrend} valueKey="count" />
                </>
              )}
            </div>
          )}

          {/* ── INSIGHTS: language breakdown, login split, level test, vocab ── */}
          {activeTab === "insights" && (
            <div className="admin-tab-panel">
              {extrasLoading ? (
                <div className="admin-empty">Loading insights...</div>
              ) : extrasError ? (
                <div className="admin-empty admin-error">{extrasError}</div>
              ) : (
                <>
                  <h2 className="admin-section-title">Level Test</h2>
<div style={{ marginBottom: 32 }}>
  <ProgressRing
    percent={levelTestStats?.completionRate ?? 0}
    label="Test Completion Rate"
    desc={`${levelTestStats?.unassignedCount ?? 0} users haven't taken the level test yet.`}
  />
</div>

                  <h2 className="admin-section-title">Sign-in Method</h2>
                  <div className="admin-level-bar-wrap" style={{ marginBottom: 32 }}>
                    <SplitBar
                      a={{ label: "Google", value: loginSplit?.google ?? 0, color: "#10b981" }}
                      b={{ label: "Email/Password", value: loginSplit?.email ?? 0, color: "#d4af37" }}
                    />
                  </div>

                  <h2 className="admin-section-title">Native Language Breakdown</h2>
                  <div className="admin-table-wrap" style={{ marginBottom: 32 }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Language</th>
                          <th>Users</th>
                          <th>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {languageBreakdown
                          .slice()
                          .sort((a, b) => b.count - a.count)
                          .map((l) => {
                            const total = languageBreakdown.reduce((s, x) => s + x.count, 0) || 1;
                            return (
                              <tr key={l.language}>
                                <td className="admin-table-highlight">{l.language}</td>
                                <td>{l.count}</td>
                                <td>{Math.round((l.count / total) * 100)}%</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  <h2 className="admin-section-title">Most Saved Vocabulary</h2>
                  <p className="admin-panel-desc">Total saves: {vocabStats?.totalSaves ?? 0}</p>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Word</th>
                          <th>Times Saved</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(vocabStats?.topWords || []).map((w) => (
                          <tr key={w.word}>
                            <td className="admin-table-highlight">{w.word}</td>
                            <td>{w.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── MESSAGES: contact form submissions ── */}
          {activeTab === "messages" && (
            <div className="admin-tab-panel">
              <h2 className="admin-section-title">Contact Form Submissions</h2>
              <p className="admin-panel-desc">Messages sent through the homepage contact form.</p>
              {extrasLoading ? (
                <div className="admin-empty">Loading messages...</div>
              ) : contactSubs.length === 0 ? (
                <div className="admin-empty">No messages yet.</div>
              ) : (
                <div className="admin-modal-list" style={{ gap: 10 }}>
                  {contactSubs
                    .slice()
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((c) => (
                      <div
                        key={c._id}
                        className="admin-table-wrap"
                        style={{ padding: 18, display: "flex", flexDirection: "column", gap: 6 }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                          <span className="admin-table-highlight">
                            {c.firstName} {c.lastName} — <span style={{ fontWeight: 400 }}>{c.email}</span>
                          </span>
                          <span className={c.status === "resolved" ? "admin-level-pill" : "admin-risk-pill"}>
                            {c.status === "resolved" ? "Resolved" : "New"}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, color: "#fff" }}>{c.subject}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{c.message}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {new Date(c.createdAt).toLocaleString()}
                          </span>
                          {c.status !== "resolved" && (
                            <button className="admin-export-btn" onClick={() => markContactResolved(c._id)}>
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}

      <style>{`
        .admin-page {
          --bg-primary: #050a08;
          --bg-secondary: #0e1f19;
          --bg-tertiary: #070d0a;
          --accent-1: #10b981;
          --accent-2: #059669;
          --accent-3: #d4af37;
          --accent-4: #b8860b;
          --glass-bg: rgba(255,255,255,0.05);
          --glass-border: rgba(255,255,255,0.09);
          --text-primary: #ffffff;
          --text-secondary: rgba(255,255,255,0.62);
          --text-muted: rgba(255,255,255,0.35);
          --shadow-glow: rgba(16,185,129,0.28);

          position: relative;
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary), var(--bg-tertiary));
          color: var(--text-primary);
          font-family: 'Inter', system-ui, sans-serif;
          overflow-x: hidden;
        }

        .admin-bg-blobs { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .blob { position: absolute; border-radius: 50%; filter: blur(130px); opacity: 0.22; }
        .blob-1 { width: 520px; height: 520px; background: radial-gradient(circle, var(--accent-1), var(--accent-2)); top: -140px; left: -140px; }
        .blob-2 { width: 420px; height: 420px; background: radial-gradient(circle, var(--accent-3), var(--accent-4)); bottom: -120px; right: -120px; }

        .admin-topbar {
          position: relative; z-index: 1;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 32px;
          background: rgba(8, 20, 15, 0.75);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid var(--glass-border);
        }
        .admin-brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 20px; cursor: pointer; }
        .admin-brand span { background: linear-gradient(135deg, var(--accent-1), var(--accent-3)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .admin-brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 15px var(--shadow-glow); font-size: 16px;
        }
        .admin-home-btn {
          padding: 9px 18px; border-radius: 10px;
          background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.12);
          color: #fff; font-weight: 600; font-size: 14px; cursor: pointer;
          transition: all 0.25s; font-family: inherit;
        }
        .admin-home-btn:hover { border-color: var(--accent-1); background: rgba(16,185,129,0.1); transform: translateY(-1px); }

        .admin-content { position: relative; z-index: 1; padding: 40px 32px 80px; max-width: 1200px; margin: 0 auto; }
        .admin-center { position: relative; z-index: 1; padding: 100px 20px; text-align: center; font-size: 16px; color: var(--text-secondary); }
        .admin-error { color: #fca5a5; }

        .admin-title {
          font-size: 32px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-3));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .admin-subtitle { font-size: 15px; color: var(--text-secondary); margin-bottom: 28px; }

        .admin-tabbar {
          display: flex; gap: 6px; margin-bottom: 32px; flex-wrap: wrap;
          background: var(--glass-bg); border: 1px solid var(--glass-border);
          border-radius: 14px; padding: 6px; width: fit-content;
        }
        .admin-tab {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 10px; border: none;
          background: transparent; color: var(--text-secondary);
          font-size: 14px; font-weight: 600; cursor: pointer;
          transition: all 0.2s; font-family: inherit; white-space: nowrap;
        }
        .admin-tab:hover { color: #fff; }
        .admin-tab.active { background: linear-gradient(135deg, var(--accent-1), var(--accent-2)); color: #fff; box-shadow: 0 4px 15px var(--shadow-glow); }
        .admin-tab-badge {
          background: rgba(239,68,68,0.85); color: #fff; font-size: 11px; font-weight: 700;
          padding: 1px 7px; border-radius: 50px; margin-left: 2px;
        }
        .admin-tab-panel { animation: adminTabFade 0.25s ease both; }
        @keyframes adminTabFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .admin-panel-header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; margin-bottom: 16px; flex-wrap: wrap;
        }
        .admin-panel-desc { font-size: 14px; color: var(--text-secondary); margin-bottom: 20px; }
        .admin-search-input {
          padding: 10px 16px; border-radius: 10px; min-width: 260px;
          background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.1);
          color: #fff; font-size: 14px; outline: none; font-family: inherit;
        }
        .admin-search-input::placeholder { color: var(--text-muted); }
        .admin-search-input:focus { border-color: rgba(16,185,129,0.5); box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .admin-panel-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.admin-export-btn {
  padding: 10px 18px; border-radius: 10px;
  background: rgba(212,175,55,0.12); border: 1.5px solid rgba(212,175,55,0.3);
  color: #f0d98a; font-weight: 600; font-size: 14px; cursor: pointer;
  transition: all 0.2s; font-family: inherit; white-space: nowrap;
}
.admin-export-btn:hover { background: rgba(212,175,55,0.2); transform: translateY(-1px); }

        .admin-empty { padding: 40px 20px; text-align: center; color: var(--text-muted); font-size: 14px; }

        .admin-card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 18px; }
        .admin-level-bar-wrap { margin-top: 4px; }
        .admin-level-bar {
          display: flex; width: 100%; height: 32px; border-radius: 10px;
          overflow: hidden; background: rgba(255,255,255,0.04); margin-bottom: 16px;
        }
        .admin-level-bar-segment { transition: opacity 0.2s; }
        .admin-level-bar-segment:hover { opacity: 0.85; }
        .admin-level-bar-legend { display: flex; flex-wrap: wrap; gap: 16px; }
        .admin-level-bar-legend-item {
          display: flex; align-items: center; gap: 8px;
          font-size: 13.5px; color: var(--text-secondary);
        }
        .admin-level-bar-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .admin-stat-card { padding: 24px 26px; border-radius: 18px; background: var(--glass-bg); border: 1px solid var(--glass-border); transition: all 0.25s; }
        .admin-stat-card:hover { transform: translateY(-4px); border-color: rgba(16,185,129,0.3); box-shadow: 0 15px 40px rgba(0,0,0,0.25), 0 0 25px var(--shadow-glow); }
        .admin-stat-icon { font-size: 22px; margin-bottom: 10px; }
        .admin-stat-value { font-size: 30px; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(135deg, var(--accent-1), var(--accent-3)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .admin-stat-label { font-size: 13px; color: var(--text-muted); margin-top: 4px; font-weight: 500; }

        .admin-section-title { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #fff; }

        .admin-table-wrap { border-radius: 18px; background: var(--glass-bg); border: 1px solid var(--glass-border); overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; min-width: 640px; }
        .admin-table th {
          text-align: left; padding: 14px 20px; font-size: 12px; letter-spacing: 0.5px;
          text-transform: uppercase; color: var(--text-muted); font-weight: 700;
          background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--glass-border);
          white-space: nowrap;
        }
        .admin-table td { padding: 14px 20px; font-size: 14px; color: var(--text-secondary); border-bottom: 1px solid var(--glass-border); white-space: nowrap; }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: rgba(255,255,255,0.03); }
        .admin-table-highlight { color: #fff; font-weight: 600; }
        .admin-row-clickable { cursor: pointer; }

        .admin-level-pill {
          display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: 600;
          background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: #6ee7b7; text-transform: capitalize;
        }
        .admin-risk-pill {
          display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 12px; font-weight: 600;
          background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5;
        }

        /* ── Mini bar trend (challenge completions / DAU) ── */
        .admin-trend-wrap {
          display: flex; align-items: flex-end; gap: 6px; height: 140px;
          padding: 20px; border-radius: 18px; background: var(--glass-bg); border: 1px solid var(--glass-border);
          margin-bottom: 8px;
        }
        .admin-trend-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
        .admin-trend-bar {
          width: 100%; max-width: 28px; border-radius: 6px 6px 0 0;
          background: linear-gradient(180deg, var(--accent-1), var(--accent-2));
          min-height: 3px;
        }
        .admin-trend-label { font-size: 10px; color: var(--text-muted); white-space: nowrap; }

        /* ── Two-value split bar (login method) ── */
        .admin-split-bar { display: flex; width: 100%; height: 32px; border-radius: 10px; overflow: hidden; background: rgba(255,255,255,0.04); margin-bottom: 14px; }
        .admin-split-seg { transition: opacity 0.2s; }
        .admin-split-seg:hover { opacity: 0.85; }
        .admin-split-legend { display: flex; gap: 20px; flex-wrap: wrap; }
        .admin-panel-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.admin-export-btn {
  padding: 10px 18px; border-radius: 10px;
  background: rgba(212,175,55,0.12); border: 1.5px solid rgba(212,175,55,0.3);
  color: #f0d98a; font-weight: 600; font-size: 14px; cursor: pointer;
  transition: all 0.2s; font-family: inherit; white-space: nowrap;
}
.admin-export-btn:hover { background: rgba(212,175,55,0.2); transform: translateY(-1px); }

/* ── Avatars ── */
.admin-avatar-cell { display: flex; align-items: center; gap: 10px; }
.admin-mini-avatar {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; color: #05100b;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-3));
}

/* ── Top performer spotlight card ── */
.admin-spotlight {
  display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
  padding: 24px 28px; border-radius: 20px; margin-bottom: 32px;
  background: linear-gradient(135deg, rgba(16,185,129,0.14), rgba(212,175,55,0.08));
  border: 1px solid rgba(212,175,55,0.3);
  position: relative; overflow: hidden;
}
.admin-spotlight::before {
  content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: conic-gradient(from 180deg, transparent, rgba(212,175,55,0.08), transparent 40%);
  animation: adminSpotlightSpin 10s linear infinite;
}
@keyframes adminSpotlightSpin { to { transform: rotate(360deg); } }
.admin-spotlight-avatar {
  width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 800; color: #05100b;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-3));
  box-shadow: 0 8px 25px rgba(212,175,55,0.3);
  position: relative; z-index: 1;
}
.admin-spotlight-body { position: relative; z-index: 1; flex: 1; min-width: 200px; }
.admin-spotlight-tag {
  font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  color: #f0d98a; margin-bottom: 4px;
}
.admin-spotlight-name { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 4px; }
.admin-spotlight-sub { font-size: 13px; color: var(--text-secondary); }
.admin-spotlight-streak {
  position: relative; z-index: 1; text-align: center;
  padding: 10px 18px; border-radius: 14px;
  background: rgba(0,0,0,0.2);
}
.admin-spotlight-streak-num { font-size: 26px; font-weight: 800; color: #fca5a5; }
.admin-spotlight-streak-label { font-size: 11px; color: var(--text-muted); }

/* ── Category icons ── */
.admin-category-cell { display: flex; align-items: center; gap: 10px; }
.admin-category-icon { font-size: 18px; }

/* ── Progress ring ── */
.admin-ring-wrap { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-bottom: 8px; }
.admin-ring { position: relative; width: 96px; height: 96px; flex-shrink: 0; }
.admin-ring svg { transform: rotate(-90deg); }
.admin-ring-track { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 8; }
.admin-ring-fill { fill: none; stroke: url(#adminRingGradient); stroke-width: 8; stroke-linecap: round; transition: stroke-dashoffset 0.6s ease; }
.admin-ring-label {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 800; color: #fff;
}
.admin-ring-desc { font-size: 13px; color: var(--text-secondary); max-width: 220px; }

        /* ── User detail modal ── */
        .admin-modal-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(0,0,0,0.65); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .admin-modal {
          width: 100%; max-width: 640px; max-height: 85vh; overflow-y: auto;
          background: rgba(10,22,17,0.98); border: 1px solid var(--glass-border);
          border-radius: 20px; padding: 32px; position: relative;
        }
        .admin-modal-close {
          position: absolute; top: 18px; right: 18px;
          width: 32px; height: 32px; border-radius: 10px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: #fff; cursor: pointer; font-size: 16px;
        }
        .admin-modal-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
        .admin-modal-avatar {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-1), var(--accent-3));
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 18px; color: #05100b; flex-shrink: 0;
        }
        .admin-modal-name { font-size: 20px; font-weight: 700; color: #fff; }
        .admin-modal-email { font-size: 13px; color: var(--text-muted); }

        .admin-modal-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }
        .admin-modal-stat { background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); border-radius: 12px; padding: 12px 14px; text-align: center; }
        .admin-modal-stat-val { font-size: 18px; font-weight: 700; color: #6ee7b7; }
        .admin-modal-stat-label { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

        .admin-modal-section { margin-bottom: 20px; }
        .admin-modal-section h4 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 10px; }
        .admin-modal-list { display: flex; flex-direction: column; gap: 6px; }
        .admin-modal-list-item {
          display: flex; justify-content: space-between; gap: 10px;
          padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.03);
          font-size: 13px; color: var(--text-secondary);
        }
        .admin-modal-loading { text-align: center; padding: 40px; color: var(--text-muted); }

        @media (max-width: 640px) {
          .admin-topbar { padding: 16px 20px; }
          .admin-content { padding: 28px 16px 60px; }
          .admin-title { font-size: 26px; }
          .admin-tabbar { width: 100%; }
          .admin-search-input { min-width: 0; width: 100%; }
          .admin-modal-stats { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  );
}

function LevelBar({ data }) {
  const order = ["basic", "intermediate", "advanced", "unassigned"];
  const labels = { basic: "Basic", intermediate: "Intermediate", advanced: "Advanced", unassigned: "Unassigned" };
  const colors = { basic: "#6ee7b7", intermediate: "#10b981", advanced: "#d4af37", unassigned: "#64748b" };

  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
  const sorted = order
    .map((key) => data.find((d) => d._id === key))
    .filter(Boolean);

  return (
    <div className="admin-level-bar-wrap">
      <div className="admin-level-bar">
        {sorted.map((d) => (
          <div
            key={d._id}
            className="admin-level-bar-segment"
            style={{ width: `${(d.count / total) * 100}%`, background: colors[d._id] }}
            title={`${labels[d._id]}: ${d.count}`}
          />
        ))}
      </div>
      <div className="admin-level-bar-legend">
        {sorted.map((d) => (
          <div className="admin-level-bar-legend-item" key={d._id}>
            <span className="admin-level-bar-dot" style={{ background: colors[d._id] }}></span>
            {labels[d._id]} — {d.count} ({Math.round((d.count / total) * 100)}%)
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple bar chart for daily trend data: [{ date: "2026-08-10", <valueKey>: 12 }, ...]
function MiniBarTrend({ data, valueKey }) {
  if (!data || data.length === 0) {
    return <div className="admin-empty">No trend data yet.</div>;
  }
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="admin-trend-wrap">
      {data.map((d) => (
        <div className="admin-trend-bar-col" key={d.date} title={`${d.date}: ${d[valueKey]}`}>
          <div
            className="admin-trend-bar"
            style={{ height: `${Math.max(((d[valueKey] || 0) / max) * 100, 3)}%` }}
          />
          <span className="admin-trend-label">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

// Two-value split bar, e.g. Google vs Email sign-in.
function SplitBar({ a, b }) {
  const total = (a.value || 0) + (b.value || 0) || 1;
  return (
    <>
      <div className="admin-split-bar">
        <div
          className="admin-split-seg"
          style={{ width: `${(a.value / total) * 100}%`, background: a.color }}
          title={`${a.label}: ${a.value}`}
        />
        <div
          className="admin-split-seg"
          style={{ width: `${(b.value / total) * 100}%`, background: b.color }}
          title={`${b.label}: ${b.value}`}
        />
      </div>
      <div className="admin-split-legend">
        <div className="admin-level-bar-legend-item">
          <span className="admin-level-bar-dot" style={{ background: a.color }}></span>
          {a.label} — {a.value} ({Math.round((a.value / total) * 100)}%)
        </div>
        <div className="admin-level-bar-legend-item">
          <span className="admin-level-bar-dot" style={{ background: b.color }}></span>
          {b.label} — {b.value} ({Math.round((b.value / total) * 100)}%)
        </div>
      </div>
    </>
  );
}

function UserDetailModal({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/user/${userId}`)
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);
  return (
    <div className="admin-modal-overlay" onClick={(e) => { if (e.target.classList.contains("admin-modal-overlay")) onClose(); }}>
      <div className="admin-modal">
        <button className="admin-modal-close" onClick={onClose}>✕</button>

        {loading ? (
          <div className="admin-modal-loading">Loading user details...</div>
        ) : !data ? (
          <div className="admin-modal-loading">Could not load this user.</div>
        ) : (
          <>
            <div className="admin-modal-header">
              <div className="admin-modal-avatar">{(data.user.username || "?")[0].toUpperCase()}</div>
              <div>
                <div className="admin-modal-name">{data.user.username}</div>
                <div className="admin-modal-email">{data.user.email}</div>
              </div>
            </div>

            <div className="admin-modal-stats">
              <div className="admin-modal-stat">
                <div className="admin-modal-stat-val">{data.user.streakDays} 🔥</div>
                <div className="admin-modal-stat-label">Streak</div>
              </div>
              <div className="admin-modal-stat">
                <div className="admin-modal-stat-val">{data.user.totalSessions}</div>
                <div className="admin-modal-stat-label">Sessions</div>
              </div>
              <div className="admin-modal-stat">
                <div className="admin-modal-stat-val">{data.user.level}</div>
                <div className="admin-modal-stat-label">Level</div>
              </div>
            </div>

            <div className="admin-modal-section">
              <h4>Recent Call Sessions</h4>
              {data.sessions?.length ? (
                <div className="admin-modal-list">
                  {data.sessions.map((s) => (
                    <div className="admin-modal-list-item" key={s._id}>
                      <span>{s.category}</span>
                      <span>{s.durationMinutes} min · {new Date(s.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No call sessions yet.</p>
              )}
            </div>

            <div className="admin-modal-section">
              <h4>Recent Activity ({data.activityLogs?.length || 0} days logged)</h4>
              {data.activityLogs?.length ? (
                <div className="admin-modal-list">
                  {data.activityLogs.slice(0, 8).map((a) => (
                    <div className="admin-modal-list-item" key={a.date}>
                      <span>{a.date}</span>
                      <span>{a.count} turns{a.secondsSpent ? ` · ${Math.round(a.secondsSpent / 60)} min` : ""}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No activity logged yet.</p>
              )}
            </div>

            <div className="admin-modal-section">
              <h4>Saved Vocabulary ({data.vocab?.length || 0})</h4>
              {data.vocab?.length ? (
                <div className="admin-modal-list">
                  {data.vocab.slice(0, 6).map((v) => (
                    <div className="admin-modal-list-item" key={v._id}>
                      <span>{v.word}</span>
                      <span>{v.meaning}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No saved words yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
function ProgressRing({ percent, label, desc }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="admin-ring-wrap">
      <div className="admin-ring">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <defs>
            <linearGradient id="adminRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>
          </defs>
          <circle className="admin-ring-track" cx="48" cy="48" r={radius} />
          <circle
            className="admin-ring-fill"
            cx="48" cy="48" r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="admin-ring-label">{percent}%</div>
      </div>
      <div>
        <div style={{ fontWeight: 700, color: "#fff", marginBottom: 4 }}>{label}</div>
        <div className="admin-ring-desc">{desc}</div>
      </div>
    </div>
  );
}

function initials(name) {
  return (name || "?")[0].toUpperCase();
}

const CATEGORY_ICONS = {
  daily: "☀️", travel: "✈️", speaking: "🗣️", grammar: "📖",
  interview: "💼", food: "🍽️", shopping: "🛒", health: "🏥",
  business: "📊", family: "👨‍👩‍👧", weather: "🌦️", hobbies: "🎨",
};