import { useState } from 'react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How does pricing work?',
      answer: 'We offer flexible pricing based on your needs. Browse deals for free, and only pay when you reserve a property. Our reservation fee is held in escrow and only released upon completion or your authorization.'
    },
    {
      question: 'Are all deals verified?',
      answer: 'Yes. Every deal on Sourcery goes through KYC/AML verification. All sourcers are verified professionals, and we calculate financials from raw data to ensure accuracy.'
    },
    {
      question: 'How does escrow protection work?',
      answer: 'Your reservation fee is held securely in escrow until you confirm deal details and reach completion. Funds are only released when you authorize it, or automatically after 72 hours post-completion.'
    },
    {
      question: 'Can I see deal details before paying?',
      answer: 'You can browse all deals with ROI, Yield, location, and strategy information for free. Full details including exact address, vendor information, and legal pack are unlocked after reservation.'
    },
    {
      question: 'What types of deals are available?',
      answer: 'We feature various property investment strategies including HMO, BTL (Buy-to-Let), Flips, and more. Filter by strategy, location, ROI range, and other criteria to find deals that match your investment goals.'
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Left Column - Header */}
          <div>
            <h2
              className="text-4xl sm:text-5xl font-normal text-[#1A2208] mb-6 leading-tight"
              style={{ fontFamily: "'Recoleta Regular', serif" }}
            >
              Frequently Asked Questions
            </h2>
            <p className="text-base text-[#5C5C49] mb-8">
              Find answers to common questions about using Sourcery.
            </p>
            <a
              href="/auth"
              className="inline-block bg-[#000000] hover:opacity-90 text-white font-medium px-6 py-3 text-sm rounded-xl transition-opacity cursor-pointer"
            >
              Get Started
            </a>
          </div>

          {/* Right Column - FAQ Accordion */}
          <div className="lg:col-span-2 space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-[#E9E6DF] cursor-pointer"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex items-center justify-between py-5">
                  <h3 className="text-base font-medium text-[#1A2208] pr-8">
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-[#5C5C49] transition-transform shrink-0 ${
                      openIndex === index ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                {openIndex === index && (
                  <div className="pb-5">
                    <p className="text-sm text-[#5C5C49] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
