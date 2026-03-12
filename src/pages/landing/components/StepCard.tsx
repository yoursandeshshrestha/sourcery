import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Heading from './Heading';
import Text from './Text';

interface StepCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  linkText?: string;
  linkTo?: string;
  className?: string;
}

export default function StepCard({
  title,
  description,
  icon,
  linkText = 'Get Started',
  linkTo = '/auth',
  className = ''
}: StepCardProps) {
  return (
    <div className={`p-8 ${className}`}>
      <div className="w-12 h-12 bg-white border border-[#E9E6DF] rounded-xl flex items-center justify-center text-[#1A2208] mb-6">
        {icon}
      </div>
      <Heading level={3} className="mb-3">
        {title}
      </Heading>
      <Text variant="small" className="leading-relaxed mb-6">
        {description}
      </Text>
      <Link
        to={linkTo}
        className="inline-flex items-center gap-2 text-sm text-[#1A2208] font-medium hover:gap-3 transition-all cursor-pointer"
      >
        {linkText}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
