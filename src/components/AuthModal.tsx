import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

export function AuthModal() {
  const { isOpen, closeAuthModal } = useAuthModal();
  const { signInWithGoogle, user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Redirect to dashboard when user is authenticated ONLY if modal is open
  useEffect(() => {
    if (isOpen && !loading && user && profile) {
      closeAuthModal();
      navigate('/dashboard/overview');
    }
  }, [isOpen, user, profile, loading, navigate, closeAuthModal]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    const { error } = await signInWithGoogle();
    if (error) {
      if (import.meta.env.DEV) {
        console.error('Error signing in with Google:', error);
      }
      toast.error('Failed to continue with Google. Please try again.');
    }
    setIsSigningIn(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeAuthModal}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-[#E9E6DF] bg-white overflow-hidden">

        {/* Modal Content */}
        <div className="flex flex-col items-center px-8 py-12">
          

          {/* Heading */}
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-[28px] font-semibold text-[#1A2208] leading-tight tracking-[-0.01em]">
              Welcome to Sourcery
            </h2>
            <p className="text-[15px] text-[#5C5C49] leading-relaxed">
              Sign in to access exclusive off-market property deals
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full max-w-sm bg-white border-2 border-[#E9E6DF] rounded-full px-6 py-3.5 flex items-center justify-center gap-3 hover:bg-[#F5F3ED] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-[15px] font-medium text-[#1A2208] tracking-[0.01em]">
                  Signing in...
                </span>
              </>
            ) : (
              <>
                <img src="/logo/google.svg" alt="Google" className="h-5 w-5" />
                <span className="text-[15px] font-medium text-[#1A2208] tracking-[0.01em]">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          {/* Trust Indicators */}
          <div className="mt-8 flex items-center gap-6 text-xs text-[#5C5C49]">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-[#6B8E23]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>Secure Sign In</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-[#6B8E23]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Data Protected</span>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-xs text-center text-[#5C5C49] max-w-xs leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-[#1A2208] cursor-pointer">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-[#1A2208] cursor-pointer">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
