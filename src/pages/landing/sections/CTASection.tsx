import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F9F7F4]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Main Column - Logo & Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4 cursor-pointer">
              <span className="text-2xl font-semibold text-[#1A2208]">Sourcery</span>
            </Link>
            <p className="text-sm text-[#5C5C49] mb-6 leading-relaxed max-w-xs">
              Verified off-market property deals with accurate financials and secure payments.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 mb-8">
              <a
                href="#"
                className="w-9 h-9 border border-[#E9E6DF] rounded-lg flex items-center justify-center text-[#5C5C49] hover:bg-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 border border-[#E9E6DF] rounded-lg flex items-center justify-center text-[#5C5C49] hover:bg-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 border border-[#E9E6DF] rounded-lg flex items-center justify-center text-[#5C5C49] hover:bg-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>

            <p className="text-xs text-[#5C5C49]">Copyright © 2026 Sourcery</p>
          </div>

          {/* Get Started */}
          <div>
            <h4 className="text-sm font-semibold text-[#1A2208] mb-4">Get Started</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  Pricing
                </a>
              </li>
              <li>
                <Link to="/auth" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  Sign up for free
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  Browse Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Strategies */}
          <div>
            <h4 className="text-sm font-semibold text-[#1A2208] mb-4">Strategies</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  HMO
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  Buy to Let
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  Flip & Refurb
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  Commercial
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  Development
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-[#1A2208] mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  Case Studies
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  API Docs
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-[#1A2208] mb-4">Company</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[#5C5C49] hover:text-[#1A2208] transition-colors cursor-pointer">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
