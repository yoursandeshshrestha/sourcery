import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#1A2208] relative overflow-hidden">
      {/* Dots Pattern Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1\' fill=\'%23FFFFFF\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '20px 20px'
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-normal text-white mb-6 leading-tight"
          style={{ fontFamily: "'Recoleta Regular', serif" }}
        >
          Ready to modernize your{' '}
          <span className="relative inline-block">
            <span className="relative z-10">property sourcing</span>
            <span
              className="absolute bottom-2 left-0 right-0 h-3 bg-[#D0EE89]"
              style={{ transform: 'translateY(0.5em)' }}
            />
          </span>
          ?
        </h2>

        <p className="text-lg text-[#E9E6DF] max-w-2xl mx-auto mb-10">
          Join hundreds of property sourcers and investors who have eliminated fraud,
          standardized financial data, and secured their transactions.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-[#E0FF82] hover:bg-[#D0EE89] text-[#1A2208] font-medium text-base px-8 py-6 rounded-xl border-0 cursor-pointer"
            >
              Start for free
            </Button>
          </Link>
          <Link to="/auth">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white font-medium text-base px-8 py-6 rounded-xl border border-white/20 cursor-pointer"
            >
              Book a demo
            </Button>
          </Link>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#E9E6DF]">
            <a href="#" className="hover:text-white transition-colors cursor-pointer">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors cursor-pointer">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors cursor-pointer">
              Contact Us
            </a>
          </div>
          <p className="mt-6 text-sm text-[#5C5C49]">
            © 2026 Sourcery. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
}
