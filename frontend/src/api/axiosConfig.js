import axios from "axios";

// Production-la, frontend (Vercel) and backend (Render) are on
// completely different domains, so we can't guess the backend URL
// from window.location anymore. Instead, use an environment variable
// set at build time (VITE_API_URL), and fall back to the old
// hostname-based logic for local dev when that variable isn't set.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : `http://${window.location.hostname}:5000/api`;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;