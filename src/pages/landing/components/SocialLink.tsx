import type { ReactNode } from 'react';

interface SocialLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
}

export default function SocialLink({ href, icon, label }: SocialLinkProps) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-9 h-9 border border-[#E9E6DF] rounded-lg flex items-center justify-center text-[#5C5C49] hover:bg-white transition-colors cursor-pointer"
    >
      {icon}
    </a>
  );
}
