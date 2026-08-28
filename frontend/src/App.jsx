import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import LevelTest from "./pages/LevelTest.jsx";
import CategorySelect from "./pages/CategorySelect.jsx";
import CallPractice from "./pages/CallPractice.jsx";
import TextPractice from "./pages/Textpractice.jsx";
import Profile from "./pages/profile.jsx";
import HomePage from "./HomePage.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import ChallengePage from "./pages/ChallengePage.jsx";
import LearnPage from "./pages/LearnPage.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Certificate from "./pages/Certificate.jsx";
import VerifyCertificate from "./pages/VerifyCertificate.jsx";
const Protected = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
};

export default function App() {
  return (
    <Routes>
      {/* ── Landing Page (first page users see) ── */}
      <Route path="/" element={<HomePage />} />

      {/* ── /login and /register removed: both now happen only via the
          modal on the homepage. Old links/bookmarks just bounce back
          to home, where the modal is available. ── */}
      <Route path="/login" element={<Navigate to="/" />} />
      <Route path="/register" element={<Navigate to="/" />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/certificate/:category"
        element={
          <Protected>
            <Certificate />
          </Protected>
        }
      />
      {/* ── PUBLIC — scanning a certificate's QR code lands here. No
          login required: an employer or anyone else checking a
          certificate's authenticity won't have a SpeakUp account. ── */}
      <Route path="/verify/:certId" element={<VerifyCertificate />} />
      <Route
        path="/challenge/:slug"
        element={
          <Protected>
            <ChallengePage />
          </Protected>
        }
      />
      <Route
        path="/learn/:slug"
        element={
          <Protected>
            <LearnPage />
          </Protected>
        }
      />
      {/* ── Protected Routes (need login) ── */}
      <Route
        path="/level-test"
        element={
          <Protected>
            <LevelTest />
          </Protected>
        }
      />
      <Route
        path="/categories"
        element={
          <Protected>
            <CategorySelect />
          </Protected>
        }
      />
      <Route
        path="/call/:category"
        element={
          <Protected>
            <CallPractice />
          </Protected>
        }
      />
      <Route
        path="/text/:category"
        element={
          <Protected>
            <TextPractice />
          </Protected>
        }
      />
      <Route
        path="/profile"
        element={
          <Protected>
            <Profile />
          </Protected>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <Protected>
            <Leaderboard />
          </Protected>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* ── Catch-all: unknown URLs go to homepage ── */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}