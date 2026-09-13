import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const [googleInfo, setGoogleInfo] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", password: "", nativeLanguage: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const stored = sessionStorage.getItem("googleSignup");
    if (stored) {
      const g = JSON.parse(stored);
      setGoogleInfo(g);
      setForm(f => ({
        ...f,
        email: g.email,
        username: (g.username || "").replace(/[^a-zA-Z0-9 ]/g, "").trim(),
      }));
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.nativeLanguage) { setError("Please select your native language."); return; }
    setLoading(true);
    try {
      if (googleInfo) {
        const { data } = await api.post("/auth/google-register", {
          email: googleInfo.email,
          username: form.username,
          photoUrl: googleInfo.photoUrl,
          uid: googleInfo.uid,
          nativeLanguage: form.nativeLanguage,
        });
        sessionStorage.removeItem("googleSignup");
        login(data.user, data.token);
        navigate(data.user.level === "unassigned" ? "/level-test" : "/categories");
      } else {
        if (!form.password) { setError("Please create a password."); setLoading(false); return; }
        const { data } = await api.post("/auth/register", form);
        navigate("/verify-email", { state: { userId: data.userId, email: form.email } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🎙️ SpeakUp</h1>
        <p className="subtitle">
          {googleInfo ? "Just a couple more details to finish setting up your account" : "Learn English by talking — 100% free"}
        </p>
        <form onSubmit={handleSubmit}>
          <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={!!googleInfo}
          />
          {!googleInfo && (
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required minLength={6} />
          )}
          <select name="nativeLanguage" value={form.nativeLanguage} onChange={handleChange} required>
            <option value="" disabled>Your native language</option>
            <option value="Tamil">Tamil</option>
            <option value="Hindi">Hindi</option>
            <option value="Telugu">Telugu</option>
            <option value="Kannada">Kannada</option>
            <option value="Malayalam">Malayalam</option>
            <option value="Other">Other</option>
          </select>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? "Creating account..." : "Create Account"}</button>
        </form>
        {!googleInfo && <p>Already have an account? <Link to="/login">Login</Link></p>}
      </div>
    </div>
  );
}