import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnboardingPage from "./pages/OnboardingPage";
import Dashboard from "./pages/Dashboard";
import ServiceForm from "./pages/ServiceForm";
import ReviewApplication from "./pages/ReviewApplication";
import ApplicationConfirmation from "./pages/ApplicationConfirmation";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/service/:serviceId" element={<ServiceForm />} />
          <Route path="/service/:serviceId/review" element={<ReviewApplication />} />
          <Route path="/service/confirmation" element={<ApplicationConfirmation />} />
          {/* Catch-all route redirecting to home */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
