import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  to?: string;
  onClick?: () => void;
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  to,
  onClick,
  className = ''
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-full transition-colors cursor-pointer inline-flex items-center justify-center';

  const variantClasses = {
    primary: 'bg-[#1287ff] hover:bg-[#0A6FE6] text-white',
    secondary: 'bg-white dark:bg-gray-800 hover:opacity-80 text-[#1287ff] border border-[#E9E6DF] dark:border-border',
    ghost: 'bg-white dark:bg-gray-800 hover:opacity-80 text-[#1287ff]'
  };

  const sizeClasses = {
    sm: 'px-5 py-2 text-[15px]',
    md: 'px-8 py-3 text-base',
    lg: 'px-10 py-4 text-lg'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (to) {
    return (
      <Link to={to}>
        <button className={classes}>
          {children}
        </button>
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
