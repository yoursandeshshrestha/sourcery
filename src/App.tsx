import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { StreamChatProvider } from '@/contexts/StreamChatContext';
import { MessagesProvider } from '@/contexts/MessagesContext';
import { AuthModal } from '@/components/AuthModal';
import { MessagesWidget, MessagesWidgetButton } from '@/components/messages/MessagesWidget';
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
import PipelinePage from '@/pages/pipeline';
import PipelineDetailPage from '@/pages/pipeline/detail';
import InvestorPipelinePage from '@/pages/account/InvestorPipelinePage';
import MessagesPage from '@/pages/messages';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <StreamChatProvider>
            <MessagesProvider>
              <AuthModalProvider>
                <ScrollToTop />
                <Toaster
                  position="top-center"
                  toastOptions={{
                    style: {
                      background: 'white',
                      color: '#0f172a',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '14px',
                      fontWeight: '500',
                    },
                    className: 'custom-toast',
                  }}
                />
                <AuthModal />
                <MessagesWidget />
                <MessagesWidgetButton />
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

          {/* Public Browsing Routes (Landing page style) */}
          <Route
            path="/deals/:id"
            element={
              <InvestorLayout>
                <PageErrorBoundary>
                  <DealDetailPage />
                </PageErrorBoundary>
              </InvestorLayout>
            }
          />
          <Route
            path="/deals"
            element={
              <DealsLayout>
                <PageErrorBoundary>
                  <BrowseDealsPage />
                </PageErrorBoundary>
              </DealsLayout>
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
            path="/account/pipeline"
            element={
              <ProtectedRoute>
                <InvestorRoute>
                  <InvestorAccountLayout>
                    <PageErrorBoundary>
                      <InvestorPipelinePage />
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

          {/* Pipeline routes */}
          <Route
            path="/dashboard/pipeline/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageErrorBoundary>
                    <PipelineDetailPage />
                  </PageErrorBoundary>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pipeline"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageErrorBoundary>
                    <PipelinePage />
                  </PageErrorBoundary>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Messages routes */}
          <Route
            path="/dashboard/messages"
            element={
              <ProtectedRoute>
                <Layout>
                  <PageErrorBoundary>
                    <MessagesPage />
                  </PageErrorBoundary>
                </Layout>
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
            </MessagesProvider>
          </StreamChatProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
