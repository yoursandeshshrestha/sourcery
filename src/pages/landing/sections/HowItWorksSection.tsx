import Section from '../components/Section';
import Container from '../components/Container';
import Heading from '../components/Heading';
import Text from '../components/Text';
import StepCard from '../components/StepCard';
import {
  SearchIcon,
  LockIcon,
  UnlockIcon,
  ChartIcon,
  CheckCircleOutlineIcon,
  CheckIcon
} from '../components/icons';

export default function HowItWorksSection() {
  const steps = [
    {
      title: 'Browse Deals',
      description: 'No signup required. See verified off-market opportunities with accurate ROI, Yield, and location info.',
      icon: <SearchIcon />
    },
    {
      title: 'Reserve Securely',
      description: 'Sign a digital NDA and pay your reservation fee. Funds held in escrow for your protection.',
      icon: <LockIcon className="w-6 h-6" />
    },
    {
      title: 'Get Full Access',
      description: 'Instantly unlock exact address, vendor details, and legal pack. Download everything you need.',
      icon: <UnlockIcon />
    },
    {
      title: 'Track Progress',
      description: 'Built-in dashboard tracks your deal through legals, valuation, mortgage offer, and exchange.',
      icon: <ChartIcon />
    },
    {
      title: 'Verify Completion',
      description: 'Review all documentation and confirm the deal meets your requirements before final authorization.',
      icon: <CheckCircleOutlineIcon />
    },
    {
      title: 'Complete the Deal',
      description: 'Authorize the sourcing fee payout after completion, or let it auto-release after 72 hours.',
      icon: <CheckIcon />
    }
  ];

  return (
    <Section background="white">
      <Container>
        <div className="bg-[#F9F7F4] dark:bg-card rounded-3xl p-12 sm:p-16">
          <div className="mb-12">
            <Text variant="small" color="secondary" className="mb-4">
              Your Investment Journey
            </Text>
            <Heading level={2} className="mb-2 inline-flex items-center gap-3">
              Your Journey — From browsing to completion
              <svg className="w-12 h-8" viewBox="0 0 48 32" fill="none">
                <path
                  d="M2 15C8 8 12 2 20 8C28 14 32 20 42 12C45 9 46 6 47 4"
                  stroke="currentColor"
                  className="text-[#000000] dark:text-gray-100"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </Heading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => {
              const isLastRow = index >= 3;
              const isRightColumnMd = index % 2 === 1;
              const isRightColumnLg = index % 3 === 2;

              return (
                <StepCard
                  key={index}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                  className={`
                    ${index < 5 ? 'border-b border-[#E9E6DF] dark:border-border' : ''}
                    ${!isRightColumnMd ? 'md:border-r border-[#E9E6DF] dark:border-border' : ''}
                    ${!isRightColumnLg ? 'lg:border-r' : 'lg:border-r-0'}
                    ${isLastRow ? 'lg:border-b-0' : ''}
                  `}
                />
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
