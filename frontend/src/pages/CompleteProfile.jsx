import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function CompleteProfile() {
  const { user, updateUser } = useAuth();
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nativeLanguage) { setError("Please select your native language."); return; }
    setError("");
    setLoading(true);
    try {
      const { data } = await api.patch("/auth/complete-profile", { nativeLanguage });
      updateUser(data.user);
      navigate(data.user.level === "unassigned" ? "/level-test" : "/categories");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🎙️ SpeakUp</h1>
        <p className="subtitle">One last step to finish setting up your account</p>
        <form onSubmit={handleSubmit}>
          <input type="email" value={user?.email || ""} disabled />
          <select value={nativeLanguage} onChange={e => setNativeLanguage(e.target.value)} required>
            <option value="" disabled>Your native language</option>
            <option value="Tamil">Tamil</option>
            <option value="Hindi">Hindi</option>
            <option value="Telugu">Telugu</option>
            <option value="Kannada">Kannada</option>
            <option value="Malayalam">Malayalam</option>
            <option value="Other">Other</option>
          </select>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? "Saving..." : "Continue"}</button>
        </form>
      </div>
    </div>
  );
}