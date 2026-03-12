import type { ReactNode } from 'react';

interface TextProps {
  children: ReactNode;
  variant?: 'body' | 'small' | 'large';
  color?: 'primary' | 'secondary';
  className?: string;
}

export default function Text({
  children,
  variant = 'body',
  color = 'secondary',
  className = ''
}: TextProps) {
  const colorClasses = {
    primary: 'text-[#1A2208]',
    secondary: 'text-[#5C5C49]'
  };

  const variantClasses = {
    small: 'text-sm',
    body: 'text-base',
    large: 'text-lg sm:text-xl'
  };

  const classes = `${variantClasses[variant]} ${colorClasses[color]} ${className}`;

  return <p className={classes}>{children}</p>;
}
