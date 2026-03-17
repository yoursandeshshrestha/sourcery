import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { AuthModal } from '@/components/AuthModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageErrorBoundary } from '@/components/PageErrorBoundary';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import SourcerRoute from '@/components/SourcerRoute';
import InvestorRoute from '@/components/InvestorRoute';
import Layout from '@/components/Layout';
import InvestorLayout from '@/components/InvestorLayout';
import InvestorAccountLayout from '@/components/InvestorAccountLayout';
import DealsLayout from '@/components/DealsLayout';
import LandingPage from '@/pages/landing';
import AuthCallback from '@/pages/auth-callback';
import DashboardPage from '@/pages/dashboard';
import SettingsPage from '@/pages/settings';
import ProfilePage from '@/pages/profile';
import ApplicationsPage from '@/pages/admin/applications';
import ApplicationDetailPage from '@/pages/admin/applications/detail';
import UsersPage from '@/pages/admin/users';
import BrowseDealsPage from '@/pages/deals/browse';
import DealDetailPage from '@/pages/deals/detail';
import CreateDealPage from '@/pages/deals/create';
import EditDealPage from '@/pages/deals/edit';
import MyDealsPage from '@/pages/deals/my-deals';
import MyReservationsPage from '@/pages/reservations/my-reservations';
import DealReservationsPage from '@/pages/reservations/deal-reservations';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AuthModalProvider>
            <ScrollToTop />
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

          {/* Deals routes */}
          <Route
            path="/dashboard/deals/create"
            element={
              <ProtectedRoute>
                <SourcerRoute>
                  <Layout>
                    <PageErrorBoundary>
                      <CreateDealPage />
                    </PageErrorBoundary>
                  </Layout>
                </SourcerRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/my-deals/:id/edit"
            element={
              <ProtectedRoute>
                <SourcerRoute>
                  <Layout>
                    <PageErrorBoundary>
                      <EditDealPage />
                    </PageErrorBoundary>
                  </Layout>
                </SourcerRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/my-deals"
            element={
              <ProtectedRoute>
                <SourcerRoute>
                  <Layout>
                    <PageErrorBoundary>
                      <MyDealsPage />
                    </PageErrorBoundary>
                  </Layout>
                </SourcerRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/deals/:id"
            element={
              <ProtectedRoute>
                <SourcerRoute>
                  <Layout>
                    <PageErrorBoundary>
                      <DealDetailPage />
                    </PageErrorBoundary>
                  </Layout>
                </SourcerRoute>
              </ProtectedRoute>
            }
          />

          {/* Investor Public Browsing Routes (Landing page style) */}
          <Route
            path="/deals/:id"
            element={
              <ProtectedRoute>
                <InvestorRoute>
                  <InvestorLayout>
                    <PageErrorBoundary>
                      <DealDetailPage />
                    </PageErrorBoundary>
                  </InvestorLayout>
                </InvestorRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deals"
            element={
              <ProtectedRoute>
                <InvestorRoute>
                  <DealsLayout>
                    <PageErrorBoundary>
                      <BrowseDealsPage />
                    </PageErrorBoundary>
                  </DealsLayout>
                </InvestorRoute>
              </ProtectedRoute>
            }
          />

          {/* Investor Account Routes (Sidebar layout) */}
          <Route
            path="/account/profile"
            element={
              <ProtectedRoute>
                <InvestorRoute>
                  <InvestorAccountLayout>
                    <PageErrorBoundary>
                      <ProfilePage />
                    </PageErrorBoundary>
                  </InvestorAccountLayout>
                </InvestorRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/reservations"
            element={
              <ProtectedRoute>
                <InvestorRoute>
                  <InvestorAccountLayout>
                    <PageErrorBoundary>
                      <MyReservationsPage />
                    </PageErrorBoundary>
                  </InvestorAccountLayout>
                </InvestorRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/settings"
            element={
              <ProtectedRoute>
                <InvestorRoute>
                  <InvestorAccountLayout>
                    <PageErrorBoundary>
                      <SettingsPage />
                    </PageErrorBoundary>
                  </InvestorAccountLayout>
                </InvestorRoute>
              </ProtectedRoute>
            }
          />

          {/* Reservation routes */}
          <Route
            path="/dashboard/reservations/deals"
            element={
              <ProtectedRoute>
                <SourcerRoute>
                  <Layout>
                    <PageErrorBoundary>
                      <DealReservationsPage />
                    </PageErrorBoundary>
                  </Layout>
                </SourcerRoute>
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/dashboard/admin/applications/:id"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout>
                    <PageErrorBoundary>
                      <ApplicationDetailPage />
                    </PageErrorBoundary>
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/applications"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout>
                    <PageErrorBoundary>
                      <ApplicationsPage />
                    </PageErrorBoundary>
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout>
                    <PageErrorBoundary>
                      <UsersPage />
                    </PageErrorBoundary>
                  </Layout>
                </AdminRoute>
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
