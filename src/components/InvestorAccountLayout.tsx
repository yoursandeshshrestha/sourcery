import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingNav from '@/components/LandingNav';
import Footer from '@/pages/landing/sections/Footer';
import { User, Settings, Receipt, Kanban, LogOut } from 'lucide-react';
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

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error logging out:', error);
      }
      toast.error('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <LandingNav />

      <main className="flex-1 pt-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6 pb-12">
            {/* Sidebar */}
            <aside className="w-[280px] shrink-0">
              <div className="bg-white rounded-2xl border border-[#E9E6DF]">
                <nav className="p-4">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-full text-[15px] font-medium transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#1287ff]/10 text-[#1287ff]'
                            : 'text-[#5C5C49] hover:bg-[#F9F7F4]'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}

                  {/* Divider */}
                  <div className="my-3 border-t border-[#E9E6DF]" />

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-[15px] font-medium text-[#5C5C49] hover:bg-[#F9F7F4] transition-colors cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-[#E9E6DF] p-8">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
