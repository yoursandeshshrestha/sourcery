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
      className="w-9 h-9 border border-[#E9E6DF] dark:border-border rounded-lg flex items-center justify-center text-[#5C5C49] dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
    >
      {icon}
    </a>
  );
}
