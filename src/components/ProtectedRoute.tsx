import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Array<'INVESTOR' | 'SOURCER' | 'ADMIN'>;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  // Redirect to landing page if not authenticated (modal will open via useEffect)
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Wait for profile to load
  if (!profile) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  // Check role-based access if required
  if (requiredRole) {
    const hasRequiredRole = requiredRole.includes(profile.role);
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F3ED] p-4">
          <div className="text-center max-w-md bg-white border border-[#E9E6DF] rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-[#1A2208] mb-2">Access Denied</h1>
            <p className="text-[#5C5C49]">
              You don't have permission to access this page. Your role is: <strong>{profile.role}</strong>
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-6 px-6 py-2.5 bg-[#1A2208] text-white rounded-full cursor-pointer hover:bg-[#2A3218] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
