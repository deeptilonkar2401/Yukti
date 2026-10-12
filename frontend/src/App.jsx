import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { ProblemProvider } from './context/ProblemContext';
import Login from './pages/login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import MyProblemsPage from './pages/MyProblemsPage';
import SubmitProblem from './pages/SubmitProblem';
import MapView from './pages/MapView';
import ProjectManagerPage from './pages/ProjectManagerPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import IndustryAnalyticsPage from './pages/IndustryAnalyticsPage';

// Navbar sirf in citizen-dashboard pages pe dikhega — Admin Portal has its own header/layout.
const CITIZEN_NAVBAR_PATHS = ['/citizen', '/my-problems', '/submit', '/map'];

function ConditionalNavbar() {
  const location = useLocation();
  if (CITIZEN_NAVBAR_PATHS.includes(location.pathname)) {
    return <Navbar />;
  }
  return null;
}

function ExternalRedirect({ to }) {
  React.useEffect(() => {
    window.location.href = to;
  }, [to]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <ConditionalNavbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/citizen" element={<CitizenDashboard />} />
          <Route path="/my-problems" element={<MyProblemsPage />} />
          <Route path="/submit" element={<SubmitProblem />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/admin" element={<ExternalRedirect to="/admin-static/admin.html" />} />
          <Route path="/university" element={<ExternalRedirect to="/university/university.html" />} />
          <Route path="/industry" element={<ExternalRedirect to="/industry/industry.html" />} />
          <Route path="/project-manager" element={<ProjectManagerPage />} />
          <Route path="/project-manager/:id" element={<ProjectManagerPage />} />
          <Route path="/projects/:id" element={<ProjectManagerPage />} />
          <Route
            path="/admin/analytics/impact"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/industry/analytics/impact"
            element={
              <ProtectedRoute allowedRoles={['industry', 'csr']}>
                <IndustryAnalyticsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <ProblemProvider>
            <div className="min-h-screen bg-bgSoft text-mainText flex flex-col">
              <AppRoutes />
            </div>
          </ProblemProvider>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}