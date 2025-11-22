import React from "react";
import { Routes, Route } from "react-router-dom";

/* Components */
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";

/* Pages */
import Landing from "./components/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./components/ForgotPassword";
import NewsFeed from "./components/NewsFeed";
import LearnMore from "./components/LearnMore";
import GetStarted from "./components/GetStarted";
import Insights from "./pages/Insights";
import Payments from "./pages/Payments";

/* Protected wrapper */
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-6xl mx-auto p-6">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/learn-more" element={<LearnMore />} />
          <Route path="/get-started" element={<GetStarted />} />

          {/* Protected pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/insights"
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}