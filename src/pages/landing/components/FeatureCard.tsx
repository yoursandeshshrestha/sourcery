import type { ReactNode } from 'react';
import Heading from './Heading';
import Text from './Text';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
}

export default function FeatureCard({ title, description, icon, className = '' }: FeatureCardProps) {
  return (
    <div className={`bg-[#F9F7F4] dark:bg-card rounded-3xl p-8 ${className}`}>
      <div className="w-14 h-14 bg-white dark:bg-gray-800 border border-transparent dark:border-border rounded-xl flex items-center justify-center text-[#1287ff] mb-6">
        {icon}
      </div>
      <Heading level={3} className="mb-3">
        {title}
      </Heading>
      <Text variant="body" className="leading-relaxed">
        {description}
      </Text>
    </div>
  );
}
