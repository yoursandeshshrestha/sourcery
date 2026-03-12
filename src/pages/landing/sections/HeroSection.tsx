import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-49 pb-20 sm:pb-32 overflow-hidden">
      {/* Dots Pattern Background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1\' fill=\'%23E9E6DF\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '20px 20px'
        }}
      />

      <div className="relative max-w-5xl mx-auto w-full text-center">
        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal mb-6 text-[#1A2208] leading-[1.1]"
            style={{ fontFamily: "'Recoleta Regular', serif" }}>
          Discover Off-Market Property Deals You Can Trust
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-[#5C5C49] max-w-2xl mx-auto mb-12 leading-relaxed">
          No more endless WhatsApp groups. Browse verified off-market deals with accurate financials, secure escrow payments, and transparent tracking.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to="/auth">
            <button className="w-full sm:w-auto bg-[#000000] hover:opacity-90 text-white font-medium text-base px-8 py-3 rounded-full transition-opacity cursor-pointer">
              Browse Deals Now
            </button>
          </Link>
          <Link to="#how-it-works">
            <button className="w-full sm:w-auto bg-white hover:opacity-80 text-[#1A2208] border border-[#E9E6DF] font-medium text-base px-8 py-3 rounded-full transition-opacity cursor-pointer">
              See How It Works
            </button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#5C5C49]">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#000000]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Verified Financials</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#000000]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Escrow Protected</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#000000]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Full Transparency</span>
          </div>
        </div>
      </div>
    </section>
  );
}
