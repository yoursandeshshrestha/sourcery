import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, ExternalLink, Shield, DollarSign, Lock, Zap, Loader2 } from 'lucide-react';
import { getConnectAccountStatus, createConnectAccount, getConnectAccountLink } from '@/lib/stripe';
import { toast } from 'sonner';

/**
 * Banner that shows for Sourcers who haven't completed Stripe onboarding
 * Appears at the top of the app to remind them to complete setup
 */
export function StripeOnboardingBanner() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  const [showExplainerModal, setShowExplainerModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, [profile?.id, profile?.role, profile?.stripe_connected_account_id]);

  const checkOnboardingStatus = async () => {
    // Only show for Sourcers
    if (profile?.role !== 'SOURCER') {
      setChecking(false);
      return;
    }

    // Check if dismissed in this session
    const dismissedKey = `stripe-banner-dismissed-${profile.id}`;
    if (sessionStorage.getItem(dismissedKey)) {
      setDismissed(true);
      setChecking(false);
      return;
    }

    // Check if they have a Stripe account
    if (!profile.stripe_connected_account_id) {
      setNeedsOnboarding(true);
      setChecking(false);
      return;
    }

    // Check if onboarding is complete
    try {
      const status = await getConnectAccountStatus();
      const needsAction = !status.onboarding_completed || status.is_restricted;
      setNeedsOnboarding(needsAction);
      setIsRestricted(status.is_restricted || false);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking Stripe status:', error);
      }
      setNeedsOnboarding(true);
      setIsRestricted(false);
    } finally {
      setChecking(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in session storage (clears when browser closes)
    sessionStorage.setItem(`stripe-banner-dismissed-${profile?.id}`, 'true');
  };

  const handleStartOnboarding = async () => {
    try {
      setLoading(true);

      // Check if account already exists
      if (profile?.stripe_connected_account_id) {
        // Get link for existing account
        const { onboarding_url } = await getConnectAccountLink();
        window.open(onboarding_url, '_blank', 'noopener,noreferrer');
      } else {
        // Create new account
        const { onboarding_url } = await createConnectAccount();
        window.open(onboarding_url, '_blank', 'noopener,noreferrer');
      }

      toast.success('Stripe onboarding opened in new tab');
      setShowExplainerModal(false);
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error starting onboarding:', error);
      }
      toast.error(error.message || 'Failed to start Stripe onboarding');
    } finally {
      setLoading(false);
    }
  };

  if (checking || !needsOnboarding || dismissed || profile?.role !== 'SOURCER') {
    return null;
  }

  return (
    <>
      <Alert
        variant="default"
        className={`mb-4 ${
          isRestricted
            ? 'border-red-200 bg-red-50 dark:bg-red-950'
            : 'border-amber-200 bg-amber-50 dark:bg-amber-950'
        }`}
      >
        <AlertTriangle className={`h-4 w-4 ${
          isRestricted
            ? 'text-red-600 dark:text-red-400'
            : 'text-amber-600 dark:text-amber-400'
        }`} />
        <AlertDescription className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <strong className={`font-semibold ${
              isRestricted
                ? 'text-red-900 dark:text-red-100'
                : 'text-amber-900 dark:text-amber-100'
            }`}>
              {isRestricted ? 'Stripe Account Restricted' : 'Complete Stripe Onboarding'}
            </strong>
            <p className={`text-sm mt-1 ${
              isRestricted
                ? 'text-red-700 dark:text-red-300'
                : 'text-amber-700 dark:text-amber-300'
            }`}>
              {isRestricted
                ? 'Your Stripe account requires verification. Complete this now to accept payments and receive payouts.'
                : 'You need to connect your Stripe account before you can list deals and receive payouts.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setShowExplainerModal(true)}
              className={`cursor-pointer ${
                isRestricted ? 'bg-red-600 hover:bg-red-700' : ''
              }`}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              {isRestricted ? 'Verify Now' : 'Complete Now'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Stripe Connect Explainer Modal */}
      {showExplainerModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-50 animate-in fade-in backdrop-blur-sm"
            onClick={() => !loading && setShowExplainerModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-background border border-border rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4 border-b border-border">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground">
                      Connect Your Stripe Account
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-sm text-muted-foreground">
                        Powered by
                      </p>
                      <img
                        src="/logo/stripe.svg"
                        alt="Stripe"
                        className="h-5 w-auto"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowExplainerModal(false)}
                  disabled={loading}
                  className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer shrink-0 ml-4"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Why Stripe Connect */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground">
                    Why do we need this?
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    To ensure you get paid securely and automatically when your deals complete, we use{' '}
                    <strong className="text-foreground">Stripe Connect</strong> - the same payment infrastructure
                    trusted by companies like Amazon, Google, and Shopify.
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    What you get:
                  </h3>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <DollarSign className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Automatic Payouts</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Receive your sourcing fees directly to your bank account when deals complete
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <Lock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Secure Escrow</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Reservation fees are held securely until deals complete, protecting both parties
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <Zap className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Fast Setup</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Takes just 2-3 minutes to connect your bank account and verify your identity
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <Shield className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Bank-Level Security</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your financial data is encrypted and never stored on our servers
                      </p>
                    </div>
                  </div>
                </div>

                {/* What Happens Next */}
                <div className="border-t border-border pt-4 space-y-3">
                  <h3 className="text-base font-semibold text-foreground">
                    What happens next?
                  </h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-primary shrink-0">1.</span>
                      <span>You'll be redirected to Stripe's secure onboarding page (opens in new tab)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-primary shrink-0">2.</span>
                      <span>Enter your business information and bank details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-primary shrink-0">3.</span>
                      <span>Verify your identity (upload ID document)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-primary shrink-0">4.</span>
                      <span>Return to Sourcery and start listing deals!</span>
                    </li>
                  </ol>
                </div>

                {/* Trust Badge */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <img
                      src="/logo/stripe.svg"
                      alt="Stripe"
                      className="h-4 w-auto"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    <strong className="text-foreground">Secure & Trusted</strong> • Sourcery never sees or stores your banking information. All data is handled directly by Stripe's PCI-compliant infrastructure.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 pt-4 border-t border-border bg-muted/30">
                <Button
                  onClick={() => setShowExplainerModal(false)}
                  variant="outline"
                  disabled={loading}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartOnboarding}
                  disabled={loading}
                  className="flex-1 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Opening Stripe...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Continue to Stripe
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
