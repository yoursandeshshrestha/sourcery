import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingNav from '@/components/LandingNav';
import Footer from '@/pages/landing/sections/Footer';
import { User, Settings, Receipt, Kanban, LogOut, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface InvestorAccountLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Profile', href: '/account/profile', icon: User },
  { name: 'My Reservations', href: '/account/reservations', icon: Receipt },
  { name: 'Pipeline', href: '/account/pipeline', icon: Kanban },
  { name: 'Settings', href: '/account/settings', icon: Settings },
];

export default function InvestorAccountLayout({ children }: InvestorAccountLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error logging out:', error);
      }
      toast.error('Failed to log out. Please try again.');
      setLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-background flex flex-col">
      <LandingNav />

      <main className="flex-1 pt-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6 pb-12">
            {/* Sidebar */}
            <aside className="w-[240px] shrink-0">
              <div className="bg-white dark:bg-card rounded-2xl border border-[#E9E6DF] dark:border-border">
                <nav className="p-4 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#1287ff]/10 text-[#1287ff]'
                            : 'text-[#5C5C49] dark:text-gray-400 hover:bg-[#F9F7F4] dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    );
                  })}

                  {/* Divider */}
                  <div className="my-3 border-t border-[#E9E6DF] dark:border-border" />

                  {/* Logout Button */}
                  <button
                    onClick={() => setShowLogoutDialog(true)}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-[#5C5C49] dark:text-gray-400 hover:bg-[#F9F7F4] dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white dark:bg-card rounded-2xl border border-[#E9E6DF] dark:border-border">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-card rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-xl">
                    <LogOut className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-gray-100">Confirm Logout</h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogoutDialog(false)}
                  disabled={loggingOut}
                  className="p-2 hover:bg-[#F9F7F4] dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer shrink-0 ml-4 disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-[#5C5C49] dark:text-gray-400" />
                </button>
              </div>

              <p className="text-[#5C5C49] dark:text-gray-400 mb-6">
                Are you sure you want to log out? You'll need to sign in again to access your account.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutDialog(false)}
                  disabled={loggingOut}
                  className="flex-1 px-4 py-2.5 border border-[#E9E6DF] dark:border-border text-[#1A1A1A] dark:text-gray-100 hover:bg-[#F9F7F4] dark:hover:bg-gray-800 text-sm font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loggingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    'Logout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
