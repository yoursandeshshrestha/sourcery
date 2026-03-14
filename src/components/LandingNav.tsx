import { Link } from 'react-router-dom';
import Container from '@/pages/landing/components/Container';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useAuth } from '@/contexts/AuthContext';

interface NavLinkProps {
  href: string;
  children: string;
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <a
      href={href}
      className="px-3 py-2 text-[15px] font-medium text-[#5C5C49] hover:bg-white rounded-lg transition-colors cursor-pointer whitespace-nowrap tracking-[0.01em] leading-[1.5em]"
    >
      {children}
    </a>
  );
}

export default function LandingNav() {
  const { openAuthModal } = useAuthModal();
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
      <Container size="xl">
        <div className="bg-white border border-[#E9E6DF] rounded-full">
          <div className="grid grid-cols-3 items-center px-6 py-3">
            <div className="flex items-center justify-start">
              <Link to="/" className="flex items-center cursor-pointer">
                <span className="text-xl font-semibold text-[#1A2208]">Sourcery</span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center justify-center gap-1">
              <NavLink href="#features">Browse Deals</NavLink>
              <NavLink href="#how-it-works">How It Works</NavLink>
              <NavLink href="#">For Investors</NavLink>
            </div>

            <div className="flex items-center justify-end gap-3">
              {user ? (
                <Link
                  to="/dashboard/overview"
                  className="px-5 py-2.5 text-[15px] font-medium text-white bg-[#1A2208] hover:bg-[#2A3218] rounded-full transition-colors cursor-pointer whitespace-nowrap tracking-[0.01em] leading-[1.5em]"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <div className="hidden md:block">
                    <button
                      onClick={openAuthModal}
                      className="px-5 py-2.5 text-[15px] font-medium text-[#1A2208] hover:bg-white rounded-full transition-colors cursor-pointer whitespace-nowrap tracking-[0.01em] leading-[1.5em]"
                    >
                      Sign in
                    </button>
                  </div>
                  <button
                    onClick={openAuthModal}
                    className="px-5 py-2.5 text-[15px] font-medium text-white bg-[#1A2208] hover:bg-[#2A3218] rounded-full transition-colors cursor-pointer whitespace-nowrap tracking-[0.01em] leading-[1.5em]"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </nav>
  );
}
