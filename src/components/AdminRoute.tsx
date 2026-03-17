import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  // Only allow ADMIN role
  if (profile.role !== 'ADMIN') {
    return <Navigate to="/dashboard/overview" replace />;
  }

  return <>{children}</>;
}
