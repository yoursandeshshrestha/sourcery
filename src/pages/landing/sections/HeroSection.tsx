import { useNavigate } from 'react-router-dom';
import Container from '../components/Container';
import Heading from '../components/Heading';
import Text from '../components/Text';
import Button from '../components/Button';
import TrustBadge from '../components/TrustBadge';
import DotsPattern from '../components/DotsPattern';

export default function HeroSection() {
  const navigate = useNavigate();

  const handleBrowseDeals = () => {
    navigate('/deals');
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pt-32 sm:pt-49 pb-20 sm:pb-32 overflow-hidden">
      <DotsPattern opacity={20} />

      <Container size="md" className="relative text-center">
        <Heading level={1} className="mb-6">
          Discover Off-Market Property Deals You Can Trust
        </Heading>

        <Text variant="large" className="max-w-2xl mx-auto mb-12 leading-relaxed">
          No more endless WhatsApp groups. Browse verified off-market deals with accurate financials, secure escrow payments, and transparent tracking.
        </Text>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={handleBrowseDeals}
            className="px-8 py-4 text-base font-medium text-white bg-[#1287ff] hover:bg-[#0A6FE6] rounded-full transition-all cursor-pointer whitespace-nowrap tracking-[0.01em] leading-[1.5em]"
          >
            Browse Deals Now
          </button>
          <Button href="#how-it-works" variant="secondary">
            See How It Works
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <TrustBadge icon={<img src="/png/check-mark.png" alt="" className="w-5 h-5" />} text="Verified Financials" />
          <TrustBadge icon={<img src="/png/check-mark.png" alt="" className="w-5 h-5" />} text="Escrow Protected" />
          <TrustBadge icon={<img src="/png/check-mark.png" alt="" className="w-5 h-5" />} text="Full Transparency" />
        </div>
      </Container>
    </section>
  );
}
