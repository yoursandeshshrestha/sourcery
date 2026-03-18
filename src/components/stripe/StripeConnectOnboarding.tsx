import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, Shield, DollarSign, Lock, Zap, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  createConnectAccount,
  getConnectAccountLink,
  getConnectAccountStatus,
} from '@/lib/stripe';

export function StripeConnectOnboarding() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showExplainerModal, setShowExplainerModal] = useState(false);
  const [status, setStatus] = useState<{
    hasAccount: boolean;
    onboardingCompleted: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    isRestricted?: boolean;
    hasRequirements?: boolean;
    disabledReason?: string | null;
    currentlyDue?: string[];
    eventuallyDue?: string[];
  } | null>(null);

  useEffect(() => {
    checkStatus();
  }, [profile?.stripe_connected_account_id]);

  const checkStatus = async () => {
    if (!profile?.stripe_connected_account_id) {
      setStatus({
        hasAccount: false,
        onboardingCompleted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      });
      setChecking(false);
      return;
    }

    try {
      setChecking(true);
      const accountStatus = await getConnectAccountStatus();
      setStatus({
        hasAccount: true,
        onboardingCompleted: accountStatus.onboarding_completed,
        chargesEnabled: accountStatus.charges_enabled,
        payoutsEnabled: accountStatus.payouts_enabled,
        isRestricted: accountStatus.is_restricted,
        hasRequirements: accountStatus.has_requirements,
        disabledReason: accountStatus.disabled_reason,
        currentlyDue: accountStatus.currently_due,
        eventuallyDue: accountStatus.eventually_due,
      });
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error checking Stripe status:', error);
      }
      toast.error('Failed to check Stripe status');
    } finally {
      setChecking(false);
    }
  };

  const handleStartOnboarding = async () => {
    try {
      setLoading(true);
      const { onboarding_url } = await createConnectAccount();

      // Open Stripe onboarding in new tab
      window.open(onboarding_url, '_blank', 'noopener,noreferrer');
      toast.success('Stripe onboarding opened in new tab');

      // Close the modal
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

  const handleContinueOnboarding = async () => {
    try {
      setLoading(true);
      const { onboarding_url } = await getConnectAccountLink();

      // Open Stripe onboarding in new tab
      window.open(onboarding_url, '_blank', 'noopener,noreferrer');
      toast.success('Stripe dashboard opened in new tab');
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error continuing onboarding:', error);
      }
      toast.error(error.message || 'Failed to continue Stripe onboarding');
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role !== 'SOURCER') {
    return null;
  }

  if (checking) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Stripe Connect</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your Stripe account to receive payouts when your deals complete
          </p>
        </div>

        {!status?.hasAccount ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Stripe Account Required</p>
                <p className="text-sm text-muted-foreground">
                  You need to connect a Stripe account to receive payouts. This is a secure
                  process managed by Stripe.
                </p>
              </div>
            </div>

            <Button
              onClick={() => setShowExplainerModal(true)}
              disabled={loading}
              className="w-full cursor-pointer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect Stripe Account
            </Button>
          </div>
        ) : status?.isRestricted ? (
          <div className="space-y-4">
            {/* Restriction Warning */}
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                  Account Restricted - Action Required
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {status.disabledReason === 'requirements.pending_verification'
                    ? 'Stripe needs to verify your identity before you can accept payments. This is a standard security requirement.'
                    : status.disabledReason === 'requirements.past_due'
                    ? 'Additional information is required to keep your account active.'
                    : 'Your account requires verification to process payments and receive payouts.'}
                </p>
                {status.hasRequirements && status.currentlyDue && status.currentlyDue.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-red-900 dark:text-red-100 mb-1">
                      Required information:
                    </p>
                    <ul className="text-xs text-red-700 dark:text-red-300 space-y-0.5 list-disc list-inside">
                      {status.currentlyDue.slice(0, 5).map((req, idx) => (
                        <li key={idx}>
                          {req.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Charges</p>
                <div className="flex items-center gap-2">
                  {status.chargesEnabled ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Enabled</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">Restricted</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Payouts</p>
                <div className="flex items-center gap-2">
                  {status.payoutsEnabled ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Enabled</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">Restricted</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleContinueOnboarding}
              disabled={loading}
              className="w-full cursor-pointer bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Complete Verification Now
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You'll be redirected to Stripe to provide the required information
            </p>
          </div>
        ) : status?.onboardingCompleted ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Stripe Account Connected
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your account is fully set up and ready to receive payouts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Charges</p>
                <div className="flex items-center gap-2">
                  {status.chargesEnabled ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Enabled</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">Disabled</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Payouts</p>
                <div className="flex items-center gap-2">
                  {status.payoutsEnabled ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Enabled</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">Disabled</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleContinueOnboarding}
              variant="outline"
              disabled={loading}
              className="w-full cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Stripe Account
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Onboarding Incomplete
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Complete your Stripe onboarding to start receiving payouts
                </p>
              </div>
            </div>

            <Button
              onClick={handleContinueOnboarding}
              disabled={loading}
              className="w-full cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Continue Stripe Onboarding
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>

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
