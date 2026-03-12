import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Container({ children, size = 'lg', className = '' }: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl'
  };

  const classes = `${sizeClasses[size]} mx-auto w-full ${className}`;

  return <div className={classes}>{children}</div>;
}
