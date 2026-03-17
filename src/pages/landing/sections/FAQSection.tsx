import { useState } from 'react';
import Section from '../components/Section';
import Container from '../components/Container';
import Heading from '../components/Heading';
import Text from '../components/Text';
import Button from '../components/Button';
import { ChevronRightIcon } from '../components/icons';

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
    <Section background="white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          <div>
            <Heading level={2} className="mb-6">
              Frequently Asked Questions
            </Heading>
            <Text variant="body" className="mb-8">
              Find answers to common questions about using Sourcery.
            </Text>
            <Button to="/auth" variant="primary" size="sm" className="rounded-xl">
              Get Started
            </Button>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-[#E9E6DF] cursor-pointer"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex items-center justify-between py-5">
                  <h3 className="text-base font-medium text-[#1287ff] pr-8">
                    {faq.question}
                  </h3>
                  <div className={`text-[#5C5C49] transition-transform shrink-0 ${openIndex === index ? 'rotate-90' : ''}`}>
                    <ChevronRightIcon className="w-5 h-5" />
                  </div>
                </div>
                {openIndex === index && (
                  <div className="pb-5">
                    <Text variant="small" className="leading-relaxed">
                      {faq.answer}
                    </Text>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
