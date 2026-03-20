import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthModal } from '@/contexts/AuthModalContext';
import Container from '../components/Container';
import Text from '../components/Text';
import SocialLink from '../components/SocialLink';
import { LinkedInIcon, YouTubeIcon, TwitterIcon } from '../components/icons';
import { Moon, Sun } from 'lucide-react';

interface FooterLinkProps {
  href?: string;
  children: string;
  isExternal?: boolean;
  onClick?: () => void;
}

function FooterLink({ href, children, isExternal = true, onClick }: FooterLinkProps) {
  if (onClick) {
    return (
      <button onClick={onClick} className="text-sm text-[#5C5C49] dark:text-gray-400 hover:text-[#1287ff] dark:hover:text-[#1287ff] transition-colors cursor-pointer text-left">
        {children}
      </button>
    );
  }
  if (isExternal && href) {
    return (
      <a href={href} className="text-sm text-[#5C5C49] dark:text-gray-400 hover:text-[#1287ff] dark:hover:text-[#1287ff] transition-colors cursor-pointer">
        {children}
      </a>
    );
  }
  if (href) {
    return (
      <Link to={href} className="text-sm text-[#5C5C49] dark:text-gray-400 hover:text-[#1287ff] dark:hover:text-[#1287ff] transition-colors cursor-pointer">
        {children}
      </Link>
    );
  }
  return null;
}

export default function Footer() {
  const { openAuthModal } = useAuthModal();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <footer className="py-16 bg-[#F9F7F4] dark:bg-background">
      <Container size="xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <Link to="/" className="inline-block mb-4 cursor-pointer">
                <span className="text-2xl font-semibold text-[#1287ff] dark:text-[#1287ff]">Sourcery</span>
              </Link>
              <Text variant="small" className="mb-6 leading-relaxed max-w-xs text-[#5C5C49] dark:text-gray-400">
                Verified off-market property deals with accurate financials and secure payments.
              </Text>

              <div className="flex items-center gap-3 mb-6">
                <SocialLink href="#" icon={<LinkedInIcon />} label="LinkedIn" />
                <SocialLink href="#" icon={<YouTubeIcon />} label="YouTube" />
                <SocialLink href="#" icon={<TwitterIcon />} label="Twitter" />
              </div>

              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E9E6DF] dark:border-border bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-6 cursor-pointer"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-4 w-4 text-[#5C5C49] dark:text-gray-400" />
                    <span className="text-sm text-[#5C5C49] dark:text-gray-400">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 text-[#5C5C49]" />
                    <span className="text-sm text-[#5C5C49]">Dark Mode</span>
                  </>
                )}
              </button>

              <Text variant="small" className="text-xs text-[#5C5C49] dark:text-gray-400">
                Copyright © 2026 Sourcery
              </Text>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#1287ff] dark:text-[#1287ff] mb-4">Get Started</h4>
              <ul className="space-y-2.5">
                <li><FooterLink href="#">Pricing</FooterLink></li>
                <li><FooterLink onClick={openAuthModal}>Sign up for free</FooterLink></li>
                <li><FooterLink onClick={openAuthModal}>Browse Deals</FooterLink></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#1287ff] dark:text-[#1287ff] mb-4">Strategies</h4>
              <ul className="space-y-2.5">
                <li><FooterLink href="#">HMO</FooterLink></li>
                <li><FooterLink href="#">Buy to Let</FooterLink></li>
                <li><FooterLink href="#">Flip & Refurb</FooterLink></li>
                <li><FooterLink href="#">Commercial</FooterLink></li>
                <li><FooterLink href="#">Development</FooterLink></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#1287ff] dark:text-[#1287ff] mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li><FooterLink href="#">Blog</FooterLink></li>
                <li><FooterLink href="#">Case Studies</FooterLink></li>
                <li><FooterLink href="#">Help Center</FooterLink></li>
                <li><FooterLink href="#">API Docs</FooterLink></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#1287ff] dark:text-[#1287ff] mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li><FooterLink href="#">About Us</FooterLink></li>
                <li><FooterLink href="#">Contact</FooterLink></li>
                <li><FooterLink href="#">Careers</FooterLink></li>
                <li><FooterLink href="#">Terms of Service</FooterLink></li>
                <li><FooterLink href="#">Privacy Policy</FooterLink></li>
              </ul>
            </div>
        </div>
      </Container>
    </footer>
  );
}
