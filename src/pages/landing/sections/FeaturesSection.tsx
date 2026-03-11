export default function FeaturesSection() {
  const features = [
    {
      title: 'Trust Engine',
      description: 'KYC/AML verified sourcers and escrow-protected payments via Stripe Connect ensure every transaction is secure.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: 'The Maths Guard',
      description: 'Auto-calculated ROI, Yield, and ROCE from raw inputs. No more manipulated financial data or impossible figures.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'The Sticky CRM',
      description: 'Built-in Kanban board tracks deals from reservation through legal completion. Keep everything on the platform.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F9F7F4]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-[#5C5C49] uppercase tracking-wide mb-4">
            Discover Sourcery
          </p>
          <h2
            className="text-4xl sm:text-5xl font-normal text-[#1F2223] mb-6 leading-tight"
            style={{ fontFamily: "'Recoleta Regular', serif" }}
          >
            A secure, modular platform built for modern{' '}
            <span className="relative inline-block">
              <span className="relative z-10">operations</span>
              <span
                className="absolute bottom-0 left-0 right-0 h-2 bg-[#D0EE89]"
                style={{ transform: 'translateY(-0.25em)' }}
              />
            </span>
          </h2>
          <p className="text-lg text-[#5C5C49] max-w-2xl mx-auto">
            Sourcery gives you the structure to build and run a marketplace that scales.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white border border-[#E9E6DF] rounded-3xl p-8 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-white border border-[#E9E6DF] rounded-xl flex items-center justify-center text-[#1F2223] mb-6 group-hover:bg-[#D0EE89] group-hover:border-[#D0EE89] transition-all duration-300">
                {feature.icon}
              </div>

              {/* Content */}
              <h3
                className="text-2xl font-normal text-[#1F2223] mb-4"
                style={{ fontFamily: "'Recoleta Regular', serif" }}
              >
                {feature.title}
              </h3>
              <p className="text-base text-[#5C5C49] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
