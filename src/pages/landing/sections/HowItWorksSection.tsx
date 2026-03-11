export default function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Browse Deals',
      description: 'No signup required. See verified off-market opportunities with accurate ROI, Yield, and location info.',
      color: 'bg-[#E0FF82]'
    },
    {
      number: '02',
      title: 'Find Your Match',
      description: 'Filter by strategy (HMO, Flip, BTL), location, ROI range. All financial data calculated by our system.',
      color: 'bg-[#D0EE89]'
    },
    {
      number: '03',
      title: 'Reserve Securely',
      description: 'Sign a digital NDA and pay your reservation fee. Funds held in escrow for your protection.',
      color: 'bg-[#E0FF82]'
    },
    {
      number: '04',
      title: 'Get Full Access',
      description: 'Instantly unlock exact address, vendor details, and legal pack. Download everything you need.',
      color: 'bg-[#D0EE89]'
    },
    {
      number: '05',
      title: 'Track Progress',
      description: 'Built-in dashboard tracks your deal through legals, valuation, mortgage offer, and exchange.',
      color: 'bg-[#E0FF82]'
    },
    {
      number: '06',
      title: 'Complete the Deal',
      description: 'When you reach completion, authorize the sourcing fee payout. Or let it auto-release after 72 hours.',
      color: 'bg-[#D0EE89]'
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-[#5C5C49] uppercase tracking-wide mb-4">
            Your Journey
          </p>
          <h2
            className="text-4xl sm:text-5xl font-normal text-[#1F2223] mb-6 leading-tight"
            style={{ fontFamily: "'Recoleta Regular', serif" }}
          >
            From browsing to{' '}
            <span className="relative inline-block">
              <span className="relative z-10">completion</span>
              <span
                className="absolute bottom-0 left-0 right-0 h-2 bg-[#D0EE89]"
                style={{ transform: 'translateY(-0.25em)' }}
              />
            </span>
          </h2>
          <p className="text-lg text-[#5C5C49] max-w-2xl mx-auto">
            Simple, secure, and transparent. Here's exactly what happens when you invest through Sourcery.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-[#F9F7F4] border border-[#E9E6DF] rounded-3xl p-8 hover:shadow-md transition-all duration-300"
            >
              {/* Step Number */}
              <div className={`inline-flex items-center justify-center w-12 h-12 ${step.color} text-[#1A2208] rounded-xl font-bold text-lg mb-4`}>
                {step.number}
              </div>

              {/* Content */}
              <h3
                className="text-xl font-normal text-[#1F2223] mb-3"
                style={{ fontFamily: "'Recoleta Regular', serif" }}
              >
                {step.title}
              </h3>
              <p className="text-sm text-[#5C5C49] leading-relaxed">
                {step.description}
              </p>

              {/* Connector Arrow (for non-last items on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <svg
                    className="w-6 h-6 text-[#D0EE89]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
