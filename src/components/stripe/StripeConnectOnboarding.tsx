import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
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
  const [status, setStatus] = useState<{
    hasAccount: boolean;
    onboardingCompleted: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
  } | null>(null);

  useEffect(() => {
    checkStatus();
  }, [profile]);

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

      // Redirect to Stripe onboarding
      window.location.href = onboarding_url;
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

      // Redirect to Stripe onboarding
      window.location.href = onboarding_url;
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
              onClick={handleStartOnboarding}
              disabled={loading}
              className="w-full cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Stripe Account
                </>
              )}
            </Button>
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
  );
}
