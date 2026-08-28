import axios from "axios";

// Was hardcoded to "http://localhost:5000/api" — that only works when
// the FRONTEND page itself was opened via "localhost", because
// "localhost" always means "this same device". A phone opening the
// frontend via your PC's LAN IP (e.g. http://192.168.1.5:5173) would
// still try to hit "localhost:5000" on ITSELF (the phone), where
// nothing is running, and every API call would fail.
//
// Fix: build the backend URL from whatever hostname the frontend was
// actually loaded from. Opened via http://localhost:5173  -> backend
// calls go to http://localhost:5000/api (unchanged, still works on the
// PC). Opened via http://192.168.1.5:5173 -> backend calls go to
// http://192.168.1.5:5000/api (now reachable from the phone too),
// as long as the backend is also running on that same PC on port 5000.
const api = axios.create({
  baseURL: `http://${window.location.hostname}:5000/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;