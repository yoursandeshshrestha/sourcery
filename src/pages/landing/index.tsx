import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import HowItWorksSection from './sections/HowItWorksSection';
import CTASection from './sections/CTASection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </div>
  );
}
