import Section from '../components/Section';
import Container from '../components/Container';
import Heading from '../components/Heading';
import Text from '../components/Text';
import FeatureCard from '../components/FeatureCard';
import { ShieldCheckIcon, CalculatorIcon, LockIcon } from '../components/icons';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Verified Deals Only',
      description: 'Every sourcer is KYC/AML verified. No more scams, ghost deals, or time-wasters. Only legitimate opportunities from trusted professionals.',
      icon: <ShieldCheckIcon />
    },
    {
      title: 'Accurate Financials',
      description: 'ROI, Yield, and ROCE calculated by our system from raw data. No more inflated numbers or manipulated figures. See the real deal metrics.',
      icon: <CalculatorIcon />
    },
    {
      title: 'Protected Payments',
      description: 'Your reservation fee is held in escrow until you confirm deal details. Track progress from reservation to legal completion in one place.',
      icon: <LockIcon />
    }
  ];

  return (
    <Section background="white">
      <Container>
        <div className="text-center mb-16">
          <Heading level={2} className="mb-6">
            Why investors choose Sourcery
          </Heading>
          <Text variant="large" className="max-w-2xl mx-auto">
            Every deal is verified, every number is accurate, and every payment is protected.
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
