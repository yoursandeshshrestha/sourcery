import { ReactNode } from 'react';

interface TrustBadgeProps {
  icon: ReactNode;
  text: string;
  className?: string;
}

export default function TrustBadge({ icon, text, className = '' }: TrustBadgeProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="text-[#000000]">{icon}</div>
      <span className="text-sm text-[#5C5C49]">{text}</span>
    </div>
  );
}
