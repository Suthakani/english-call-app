import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosConfig.js";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", nativeLanguage: "Tamil" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      navigate("/verify-email", { state: { userId: data.userId, email: form.email } });
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
        <p className="subtitle">Learn English by talking — 100% free</p>
        <form onSubmit={handleSubmit}>
          <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required minLength={6} />
          <select name="nativeLanguage" value={form.nativeLanguage} onChange={handleChange}>
            <option>Tamil</option>
            <option>Hindi</option>
            <option>Telugu</option>
            <option>Kannada</option>
            <option>Malayalam</option>
            <option>Other</option>
          </select>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? "Creating account..." : "Create Account"}</button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
