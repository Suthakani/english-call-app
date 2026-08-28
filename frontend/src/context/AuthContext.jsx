import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosConfig.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Avatar images (base64 data URIs) can be several hundred KB — easily
  // blowing past localStorage's ~5MB total quota. We deliberately never
  // write avatarUrl to localStorage; only the small identity fields are
  // persisted there. The real avatarUrl instead comes fresh from the
  // backend every time the app loads (see the useEffect below), so it's
  // always accurate and never triggers a quota error.
  const persistUser = (userData) => {
    const { avatarUrl, ...toPersist } = userData || {};
    try {
      localStorage.setItem("user", JSON.stringify(toPersist));
    } catch (err) {
      console.warn("Could not persist user to localStorage:", err);
    }
  };

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    persistUser(userData);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (patch) => {
    setUser(prev => {
      const updated = { ...prev, ...patch };
      persistUser(updated);
      return updated;
    });
  };

  // On every fresh page load, localStorage never had avatarUrl to begin
  // with (see persistUser above) — so re-fetch the full profile from the
  // backend once here to hydrate it. This is what keeps the navbar avatar
  // and the profile page avatar in sync after a reload, instead of the
  // navbar falling back to the generated placeholder.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    api.get('/user/profile')
      .then(({ data }) => {
        setUser(prev => (prev ? { ...prev, ...data } : prev));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);