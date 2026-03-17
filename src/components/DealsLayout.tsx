import { type ReactNode } from 'react';

interface DealsLayoutProps {
  children: ReactNode;
}

export default function DealsLayout({ children }: DealsLayoutProps) {
  return (
    <div className="h-screen bg-[#F9F7F4] flex flex-col overflow-hidden">
      {children}
    </div>
  );
}
