import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface InvestorRouteProps {
  children: React.ReactNode;
}

export default function InvestorRoute({ children }: InvestorRouteProps) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Only allow INVESTOR role
  if (profile && profile.role !== 'INVESTOR') {
    // Redirect sourcers/admins to their dashboard
    return <Navigate to="/dashboard/overview" replace />;
  }

  return <>{children}</>;
}
