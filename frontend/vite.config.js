import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // host: true binds Vite to 0.0.0.0 instead of just localhost, so
    // other devices on the same WiFi (like a phone) can reach it using
    // your PC's LAN IP — e.g. http://192.168.1.5:5173. Without this,
    // the dev server only accepts connections from the PC itself.
    host: true,
    headers: {
      // Firebase's signInWithPopup needs to close its own popup window
      // after Google sign-in. The default Cross-Origin-Opener-Policy
      // browsers assume (or one set upstream) blocks that window.close()
      // call, which can leave a stale/previous auth popup result behind
      // instead of the account the user just picked. Relaxing this for
      // local dev fixes that.
      "Cross-Origin-Opener-Policy": "unsafe-none",
    },
  },
});