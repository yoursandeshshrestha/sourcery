import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import AuthPage from '@/pages/auth';
import AuthCallback from '@/pages/auth-callback';
import DashboardPage from '@/pages/dashboard';
import SettingsPage from '@/pages/settings';

const ProfilePage = () => <div className="p-6"><h1 className="text-2xl font-bold">Profile</h1><p className="text-muted-foreground mt-2">Coming soon...</p></div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

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

          {/* Redirect root to dashboard overview */}
          <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
          <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
