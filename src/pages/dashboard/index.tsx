import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  useEffect(() => {
    // Redirect investors to the deals page
    if (profile?.role === 'INVESTOR') {
      navigate('/deals', { replace: true });
    }
  }, [profile, navigate]);

  return (
    <div className="px-6 pt-6 pb-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">
          Welcome back!
        </h1>
        <p className="text-muted-foreground">
          Your dashboard is ready.
        </p>
      </div>
    </div>
  );
}
