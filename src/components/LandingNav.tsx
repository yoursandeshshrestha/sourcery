import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-[#E9E6DF] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-[#1A2208] rounded-lg flex items-center justify-center">
                <span className="text-[#E0FF82] font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-semibold text-[#1F2223]">Sourcery</span>
            </Link>

            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-2">
              <a
                href="#features"
                className="px-4 py-2 text-sm font-medium text-[#5C5C49] hover:text-[#1F2223] hover:bg-[#F9F7F4] rounded-lg transition-colors cursor-pointer"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="px-4 py-2 text-sm font-medium text-[#5C5C49] hover:text-[#1F2223] hover:bg-[#F9F7F4] rounded-lg transition-colors cursor-pointer"
              >
                How It Works
              </a>
              <a
                href="#"
                className="px-4 py-2 text-sm font-medium text-[#5C5C49] hover:text-[#1F2223] hover:bg-[#F9F7F4] rounded-lg transition-colors cursor-pointer"
              >
                Pricing
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link to="/auth" className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-[#F9F7F4] text-[#1A2208] border border-[#E9E6DF] rounded-lg px-4 py-2 text-sm font-medium cursor-pointer"
                >
                  Sign in
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  size="sm"
                  className="bg-[#E0FF82] hover:bg-[#D0EE89] text-[#1A2208] border-0 rounded-lg px-4 py-2 text-sm font-medium cursor-pointer"
                >
                  Start for free
                </Button>
              </Link>
              <Link to="/auth" className="lg:hidden">
                <Button
                  size="sm"
                  className="bg-[#1A2208] hover:bg-[#2A3218] text-white border-0 rounded-lg px-4 py-2 text-sm font-medium cursor-pointer"
                >
                  Book a demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
