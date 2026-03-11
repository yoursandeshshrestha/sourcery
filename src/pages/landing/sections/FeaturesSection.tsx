export default function FeaturesSection() {
  const features = [
    {
      title: 'Verified Deals Only',
      description: 'Every sourcer is KYC/AML verified. No more scams, ghost deals, or time-wasters. Only legitimate opportunities from trusted professionals.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: 'Accurate Financials',
      description: 'ROI, Yield, and ROCE calculated by our system from raw data. No more inflated numbers or manipulated figures. See the real deal metrics.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Protected Payments',
      description: 'Your reservation fee is held in escrow until you confirm deal details. Track progress from reservation to legal completion in one place.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl sm:text-5xl font-normal text-[#1A2208] mb-6 leading-tight"
            style={{ fontFamily: "'Recoleta Regular', serif" }}
          >
            Why investors choose Sourcery
          </h2>
          <p className="text-lg text-[#5C5C49] max-w-2xl mx-auto">
            Every deal is verified, every number is accurate, and every payment is protected.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#F9F7F4] rounded-3xl p-8"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-[#1A2208] mb-6">
                {feature.icon}
              </div>

              {/* Content */}
              <h3
                className="text-xl font-normal text-[#1A2208] mb-3"
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
