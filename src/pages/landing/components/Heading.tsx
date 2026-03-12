import { ReactNode } from 'react';

interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
}

export default function Heading({ children, level = 1, className = '' }: HeadingProps) {
  const baseClasses = 'font-normal text-[#1A2208]';
  const fontFamily = { fontFamily: "'Recoleta Regular', serif" };

  const levelClasses = {
    1: 'text-5xl sm:text-6xl lg:text-7xl leading-[1.1]',
    2: 'text-4xl sm:text-5xl leading-tight',
    3: 'text-xl leading-normal'
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const classes = `${baseClasses} ${levelClasses[level]} ${className}`;

  return <Tag className={classes} style={fontFamily}>{children}</Tag>;
}
