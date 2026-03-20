import type { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  background?: 'primary' | 'white';
  padding?: 'normal' | 'large';
  className?: string;
}

export default function Section({
  children,
  background = 'white',
  padding = 'normal',
  className = ''
}: SectionProps) {
  const bgClasses = {
    primary: 'bg-[#F9F7F4] dark:bg-background',
    white: 'bg-white dark:bg-background'
  };

  const paddingClasses = {
    normal: 'py-24 px-4 sm:px-6 lg:px-8',
    large: 'py-32 px-4 sm:px-6 lg:px-8'
  };

  const classes = `${bgClasses[background]} ${paddingClasses[padding]} ${className}`;

  return <section className={classes}>{children}</section>;
}
