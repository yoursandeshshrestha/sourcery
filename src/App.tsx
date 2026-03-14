import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { AuthModal } from '@/components/AuthModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import LandingPage from '@/pages/landing';
import AuthCallback from '@/pages/auth-callback';
import DashboardPage from '@/pages/dashboard';
import SettingsPage from '@/pages/settings';
import ProfilePage from '@/pages/profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthModalProvider>
          <AuthModal />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Redirect old /auth route to landing */}
            <Route path="/auth" element={<Navigate to="/" replace />} />

          {/* Protected routes */}
          <Route
            path="/dashboard/overview"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Redirect /dashboard to overview */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />

            {/* 404 - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthModalProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
