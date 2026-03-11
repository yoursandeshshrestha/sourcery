import { Link } from 'react-router-dom';

export default function HowItWorksSection() {
  const steps = [
    {
      title: 'Browse Deals',
      description: 'No signup required. See verified off-market opportunities with accurate ROI, Yield, and location info.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      title: 'Reserve Securely',
      description: 'Sign a digital NDA and pay your reservation fee. Funds held in escrow for your protection.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      title: 'Get Full Access',
      description: 'Instantly unlock exact address, vendor details, and legal pack. Download everything you need.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Track Progress',
      description: 'Built-in dashboard tracks your deal through legals, valuation, mortgage offer, and exchange.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: 'Verify Completion',
      description: 'Review all documentation and confirm the deal meets your requirements before final authorization.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Complete the Deal',
      description: 'Authorize the sourcing fee payout after completion, or let it auto-release after 72 hours.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#F9F7F4] rounded-3xl p-12 sm:p-16">
          {/* Section Header */}
          <div className="mb-12">
            <p className="text-sm text-[#5C5C49] mb-4">Your Investment Journey</p>
            <h2
              className="text-4xl sm:text-5xl font-normal text-[#1A2208] mb-2 leading-tight inline-flex items-center gap-3"
              style={{ fontFamily: "'Recoleta Regular', serif" }}
            >
              Your Journey — From browsing to completion
              <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                <path
                  d="M2 15C8 8 12 2 20 8C28 14 32 20 42 12C45 9 46 6 47 4"
                  stroke="#000000"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </h2>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => {
              const isLastRow = index >= 3;
              const isRightColumnMd = index % 2 === 1; // Right column in 2-col layout
              const isRightColumnLg = index % 3 === 2; // Right column in 3-col layout

              return (
                <div
                  key={index}
                  className={`p-8
                    ${index < 5 ? 'border-b border-[#E9E6DF]' : ''}
                    ${!isRightColumnMd ? 'md:border-r border-[#E9E6DF]' : ''}
                    ${!isRightColumnLg ? 'lg:border-r' : 'lg:border-r-0'}
                    ${isLastRow ? 'lg:border-b-0' : ''}
                  `}
                >
                {/* Icon */}
                <div className="w-12 h-12 bg-white border border-[#E9E6DF] rounded-xl flex items-center justify-center text-[#1A2208] mb-6">
                  {step.icon}
                </div>

                {/* Content */}
                <h3
                  className="text-xl font-normal text-[#1A2208] mb-3"
                  style={{ fontFamily: "'Recoleta Regular', serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-[#5C5C49] leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Link */}
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 text-sm text-[#1A2208] font-medium hover:gap-3 transition-all cursor-pointer"
                >
                  Get Started
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
