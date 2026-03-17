import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (import.meta.env.DEV) {
          console.log('🔄 [AuthCallback] Starting callback');
          console.log('📍 [AuthCallback] URL:', window.location.href);
        }

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (import.meta.env.DEV) {
          console.log('📡 [AuthCallback] Session check:', {
            hasSession: !!session,
            userEmail: session?.user?.email,
            error: sessionError
          });
        }

        if (sessionError) throw sessionError;

        if (!session) {
          if (import.meta.env.DEV) {
            console.log('🚫 [AuthCallback] No session found, redirecting to /auth');
          }
          navigate('/auth');
          return;
        }

        // Check if profile exists
        if (import.meta.env.DEV) {
          console.log('🔍 [AuthCallback] Checking for profile...');
        }
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (import.meta.env.DEV) {
          console.log('📦 [AuthCallback] Profile check result:', {
            hasProfile: !!profile,
            profileRole: profile?.role,
            error: profileError
          });
        }

        if (profileError) {
          if (import.meta.env.DEV) {
            console.error('❌ [AuthCallback] Profile fetch error:', profileError);
          }
          throw profileError;
        }

        if (profile) {
          // Profile exists - redirect based on role
          if (import.meta.env.DEV) {
            console.log('✈️ [AuthCallback] Profile found, redirecting based on role:', profile.role);
          }

          // Redirect investors to landing page, others to dashboard
          if (profile.role === 'INVESTOR') {
            navigate('/', { replace: true });
          } else {
            navigate('/dashboard/overview', { replace: true });
          }
        } else {
          // No profile - this shouldn't happen with auto-create trigger
          if (import.meta.env.DEV) {
            console.log('⚠️ [AuthCallback] No profile found - redirecting to auth');
          }
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ [AuthCallback] Error:', error);
        }
        setError('Failed to complete sign in. Please try again.');
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <p className="text-lg font-medium text-foreground">{error}</p>
          <p className="mt-2 text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <LoadingSpinner fullScreen message="Completing sign in..." />;
}
