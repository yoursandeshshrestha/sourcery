export default function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Supply Generation',
      description: 'Verified Sourcer uploads deal. Backend auto-calculates financials (Yield/ROI).',
      color: 'bg-[#E0FF82]'
    },
    {
      number: '02',
      title: 'Redacted Discovery',
      description: 'Investors browse feed. Critical data (address, vendor, docs) hidden by RLS.',
      color: 'bg-[#D0EE89]'
    },
    {
      number: '03',
      title: 'The Lock',
      description: 'Investor clicks "Reserve", signs digital NDA, pays reservation fee via Stripe.',
      color: 'bg-[#E0FF82]'
    },
    {
      number: '04',
      title: 'Escrow Hold',
      description: 'Stripe captures funds in platform balance.',
      color: 'bg-[#D0EE89]'
    },
    {
      number: '05',
      title: 'The Unlock',
      description: 'Stripe webhook triggers DB update. RLS policy grants access to redacted data.',
      color: 'bg-[#E0FF82]'
    },
    {
      number: '06',
      title: 'Progression',
      description: 'Both parties use Kanban to track deal through legals, valuation, and exchange.',
      color: 'bg-[#D0EE89]'
    },
    {
      number: '07',
      title: 'Completion',
      description: 'Deal completes. System triggers Stripe transfer. Sourcing fee paid (minus commission).',
      color: 'bg-[#E0FF82]'
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-[#5C5C49] uppercase tracking-wide mb-4">
            The Core Loop
          </p>
          <h2
            className="text-4xl sm:text-5xl font-normal text-[#1F2223] mb-6 leading-tight"
            style={{ fontFamily: "'Recoleta Regular', serif" }}
          >
            How Sourcery{' '}
            <span className="relative inline-block">
              <span className="relative z-10">works</span>
              <span
                className="absolute bottom-0 left-0 right-0 h-2 bg-[#D0EE89]"
                style={{ transform: 'translateY(-0.25em)' }}
              />
            </span>
          </h2>
          <p className="text-lg text-[#5C5C49] max-w-2xl mx-auto">
            From deal upload to completion, every step is designed for security and transparency.
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
