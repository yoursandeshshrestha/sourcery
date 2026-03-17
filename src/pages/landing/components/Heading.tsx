import { createElement } from 'react';
import type { ReactNode } from 'react';

interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
}

export default function Heading({ children, level = 1, className = '' }: HeadingProps) {
  const baseClasses = 'font-normal text-[#1287ff]';
  const fontFamily = { fontFamily: "'Recoleta Regular', serif" };

  const levelClasses = {
    1: 'text-5xl sm:text-6xl lg:text-7xl leading-[1.1]',
    2: 'text-4xl sm:text-5xl leading-tight',
    3: 'text-xl leading-normal'
  };

  const tag = `h${level}`;
  const classes = `${baseClasses} ${levelClasses[level]} ${className}`;

  return createElement(tag, { className: classes, style: fontFamily }, children);
}
