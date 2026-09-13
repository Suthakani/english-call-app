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
import MasteryReward from "./pages/MasteryReward.jsx";
import TournamentPage from "./pages/TournamentPage.jsx";
import HallOfFame from "./pages/HallOfFame.jsx";
import VerifyCertificate from "./pages/VerifyCertificate.jsx";
import Winners from './pages/Winners.jsx';
import WinnerPopup from './pages/WinnerPopup.jsx';
import EventPosterPopup from './pages/EventPosterPopup.jsx';
import FeaturesDetailPage from "./pages/FeaturesDetailPage.jsx";
import CategoriesDetailPage from "./pages/CategoriesDetailPage.jsx";
import HowItWorksDetailPage from "./pages/HowItWorksDetailPage.jsx";
import FaqDetailPage from "./pages/FaqDetailPage.jsx";
import ComparisonDetailPage from "./pages/ComparisonDetailPage.jsx";
import TestimonialsDetailPage from "./pages/TestimonialsDetailPage.jsx";
import VocabDetailPage from "./pages/VocabDetailPage.jsx";
import StreakDetailPage from "./pages/StreakDetailPage.jsx";
import FindPartner from './pages/FindPartner.jsx';
import PendingMatches from './pages/admin/PendingMatches.jsx';
import PracticeCall from './pages/PracticeCall.jsx';
const Protected = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
};

export default function App() {
  return (
    <>
      <WinnerPopup />
      <EventPosterPopup />
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
          path="/mastery/:category"
          element={
            <Protected>
              <MasteryReward />
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
          path="/tournament"
          element={
            <Protected>
              <TournamentPage />
            </Protected>
          }
        />
        <Route
          path="/hall-of-fame"
          element={
            <Protected>
              <HallOfFame />
            </Protected>
          }
        />
        <Route
          path="/winners"
          element={
            <Protected>
              <Winners />
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
       {/* ── Section detail pages (opened from homepage heading clicks) ── */}
<Route path="/features" element={<FeaturesDetailPage />} />
<Route path="/learning-categories" element={<CategoriesDetailPage />} />
<Route path="/how-it-works" element={<HowItWorksDetailPage />} />
<Route path="/faq" element={<FaqDetailPage />} />
<Route path="/why-speakup" element={<ComparisonDetailPage />} />
<Route path="/reviews" element={<TestimonialsDetailPage />} />
<Route path="/vocabulary-boost" element={<VocabDetailPage />} />
<Route path="/streak" element={<StreakDetailPage />} />
<Route path="/find-partner" element={<FindPartner />} />
<Route path="/admin/matches" element={<PendingMatches />} />
<Route path="/practice-call/:sessionId" element={<PracticeCall />} />

{/* Catch-all: unknown URLs go to homepage */}
<Route path="*" element={<Navigate to="/" />} />
</Routes>
    </>
  );
}