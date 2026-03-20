import { type ReactNode } from 'react';
import LandingNav from '@/components/LandingNav';
import Footer from '@/pages/landing/sections/Footer';

interface InvestorLayoutProps {
  children: ReactNode;
}

export default function InvestorLayout({ children }: InvestorLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F9F7F4] dark:bg-background flex flex-col">
      <LandingNav />
      <main className="flex-1 pt-24">
        {children}
      </main>
      <Footer />
    </div>
  );
}
