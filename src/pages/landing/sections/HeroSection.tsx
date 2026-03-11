import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Dots Pattern Background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1\' fill=\'%23E9E6DF\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '20px 20px'
        }}
      />

      <div className="relative max-w-6xl mx-auto w-full text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D0EE89] border border-[#1A2208] mb-8 cursor-pointer hover:bg-[#E0FF82] transition-colors">
          <span className="px-2 py-0.5 bg-[#1A2208] text-white text-xs font-medium rounded-full">
            New
          </span>
          <span className="text-[#1A2208] text-sm font-medium tracking-wide">
            Off-Market Property Deals
          </span>
          <svg
            className="w-4 h-4 text-[#1A2208]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-normal mb-6 text-[#1F2223] leading-[1.15]"
            style={{ fontFamily: "'Recoleta Regular', serif" }}>
          Find verified off-market deals in{' '}
          <span className="relative inline-block">
            <span className="relative z-10">one place</span>
            <span
              className="absolute bottom-2 left-0 right-0 h-3 bg-[#D0EE89] z-0"
              style={{ transform: 'translateY(0.5em)' }}
            />
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-[#5C5C49] max-w-3xl mx-auto mb-10 leading-relaxed">
          Stop scrolling through 50 WhatsApp groups. Access curated off-market property deals
          with verified data, secure payments, and end-to-end tracking.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-[#E0FF82] hover:bg-[#D0EE89] text-[#1A2208] font-medium text-base px-8 py-6 rounded-xl border-0 cursor-pointer"
            >
              Browse Deals Now
            </Button>
          </Link>
          <Link to="/auth">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-[#1A2208] hover:bg-[#2A3218] text-white font-medium text-base px-8 py-6 rounded-xl border border-white/10 cursor-pointer"
            >
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-[#5C5C49]">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#D0EE89]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Verified Financials</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#D0EE89]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#D0EE89]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>No Signup Required to Browse</span>
          </div>
        </div>
      </div>
    </section>
  );
}
