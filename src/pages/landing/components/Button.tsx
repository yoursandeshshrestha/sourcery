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
  const baseClasses = 'font-medium rounded-full transition-opacity cursor-pointer inline-flex items-center justify-center';

  const variantClasses = {
    primary: 'bg-[#000000] hover:opacity-90 text-white',
    secondary: 'bg-white hover:opacity-80 text-[#1A2208] border border-[#E9E6DF]',
    ghost: 'bg-white hover:opacity-80 text-[#1A2208]'
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
