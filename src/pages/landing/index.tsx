import LandingNav from '@/components/LandingNav';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import HowItWorksSection from './sections/HowItWorksSection';
import FAQSection from './sections/FAQSection';
import AIAssistSection from './sections/AIAssistSection';
import CTASection from './sections/CTASection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F4]">
      <LandingNav />
      <HeroSection />
      <div id="features">
        <FeaturesSection />
      </div>
      <div id="how-it-works">
        <HowItWorksSection />
      </div>
      <FAQSection />
      <AIAssistSection />
      <CTASection />
    </div>
  );
}
