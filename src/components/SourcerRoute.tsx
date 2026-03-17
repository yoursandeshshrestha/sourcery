import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface SourcerRouteProps {
  children: React.ReactNode;
}

export default function SourcerRoute({ children }: SourcerRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  // Only allow SOURCER or ADMIN roles
  if (profile.role !== 'SOURCER' && profile.role !== 'ADMIN') {
    return <Navigate to="/dashboard/deals" replace />;
  }

  return <>{children}</>;
}
