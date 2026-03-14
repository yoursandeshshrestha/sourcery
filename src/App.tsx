import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { AuthModal } from '@/components/AuthModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageErrorBoundary } from '@/components/PageErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import LandingPage from '@/pages/landing';
import AuthCallback from '@/pages/auth-callback';
import DashboardPage from '@/pages/dashboard';
import SettingsPage from '@/pages/settings';
import ProfilePage from '@/pages/profile';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AuthModalProvider>
            <Toaster position="top-right" richColors />
            <AuthModal />
            <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <PageErrorBoundary>
                  <LandingPage />
                </PageErrorBoundary>
              }
            />
            <Route
              path="/auth/callback"
              element={
                <PageErrorBoundary>
                  <AuthCallback />
                </PageErrorBoundary>
              }
            />

            {/* Redirect old /auth route to landing */}
            <Route path="/auth" element={<Navigate to="/" replace />} />

          {/* Protected routes */}
          <Route
            path="/dashboard/overview"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageErrorBoundary>
                    <DashboardPage />
                  </PageErrorBoundary>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageErrorBoundary>
                    <SettingsPage />
                  </PageErrorBoundary>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageErrorBoundary>
                    <ProfilePage />
                  </PageErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
