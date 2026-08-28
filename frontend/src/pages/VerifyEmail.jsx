import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../homepage.css";

export default function VerifyEmail() {
  const { state } = useLocation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", { userId: state.userId, otp });
      login(data.user, data.token);
      navigate("/level-test");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    await api.post("/auth/resend-otp", { userId: state.userId });
    alert("OTP resent to " + state.email);
  };

  if (!state?.userId) {
    return (
      <div
        className="homepage-body"
        style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div className="bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
        <div className="noise"></div>
        <div className="auth-modal" style={{ position: "relative", transform: "none", animation: "none" }}>
          <p style={{ position: "relative", zIndex: 1 }}>Invalid access. Please register first.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="homepage-body"
      style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}
    >
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <div className="noise"></div>

      <div className="auth-modal" style={{ position: "relative", transform: "none", animation: "none" }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">✉️</div>
        </div>
        <h1 className="auth-logo-text" style={{ marginBottom: 6 }}>
          Verify your <span className="gradient-text">email</span>
        </h1>
        <p className="auth-subtitle">
          We sent a 6-digit code to <strong style={{ color: "#fff" }}>{state.email}</strong>
        </p>

        <form className="auth-form" onSubmit={handleVerify}>
          <input
            className="auth-input"
            style={{ textAlign: "center", letterSpacing: "6px", fontSize: 20, fontWeight: 700 }}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="······"
            maxLength={6}
            required
          />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Verifying…" : "Verify"}
          </button>
        </form>

        <div className="auth-footer">
          <a onClick={resend}>Resend OTP</a>
        </div>
      </div>
    </div>
  );
}