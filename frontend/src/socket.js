import { io } from "socket.io-client";

// Same pattern as axiosConfig.js — VITE_API_URL is the bare backend
// origin (no /api suffix), with a hostname-based fallback for local dev.
const SOCKET_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`;

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false });
  }
  return socket;
};

export const connectSocket = (userId) => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.once("connect", () => s.emit("identify", userId));
  } else {
    s.emit("identify", userId);
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) socket.disconnect();
};