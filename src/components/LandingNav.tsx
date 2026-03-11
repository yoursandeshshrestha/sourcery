import { Link } from 'react-router-dom';

export default function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-[#E9E6DF] rounded-full">
          <div className="grid grid-cols-3 items-center px-6 py-3">
            {/* Left Section - Logo */}
            <div className="flex items-center justify-start">
              <Link to="/" className="flex items-center cursor-pointer">
                <span className="text-xl font-semibold text-[#1A2208]">Sourcery</span>
              </Link>
            </div>

            {/* Center Section - Navigation Links */}
            <div className="hidden lg:flex items-center justify-center gap-1">
              <a
                href="#features"
                className="px-3 py-2 text-[15px] font-medium text-[#5C5C49] hover:bg-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                style={{ letterSpacing: '0.01em', lineHeight: '1.5em' }}
              >
                Browse Deals
              </a>
              <a
                href="#how-it-works"
                className="px-3 py-2 text-[15px] font-medium text-[#5C5C49] hover:bg-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                style={{ letterSpacing: '0.01em', lineHeight: '1.5em' }}
              >
                How It Works
              </a>
              <a
                href="#"
                className="px-3 py-2 text-[15px] font-medium text-[#5C5C49] hover:bg-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                style={{ letterSpacing: '0.01em', lineHeight: '1.5em' }}
              >
                For Investors
              </a>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <Link to="/auth" className="hidden md:block">
                <button
                  className="bg-white hover:opacity-80 text-[#1A2208] font-medium px-5 py-2 text-[15px] rounded-full transition-opacity cursor-pointer"
                  style={{ letterSpacing: '0.01em' }}
                >
                  Sign in
                </button>
              </Link>
              <Link to="/auth">
                <button
                  className="bg-[#000000] hover:opacity-90 text-white font-medium px-5 py-2 text-[15px] rounded-full transition-opacity cursor-pointer"
                  style={{ letterSpacing: '0.01em' }}
                >
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
