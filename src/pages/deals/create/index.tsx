import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DealForm } from '@/components/deals/DealForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, ExternalLink, CheckCircle2 } from 'lucide-react';
import { getConnectAccountStatus } from '@/lib/stripe';
import { toast } from 'sonner';

export default function CreateDealPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    checkStripeStatus();
  }, [profile]);

  const checkStripeStatus = async () => {
    if (!profile?.stripe_connected_account_id) {
      setOnboardingComplete(false);
      setChecking(false);
      return;
    }

    try {
      const status = await getConnectAccountStatus();
      setOnboardingComplete(status.onboarding_completed);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking Stripe status:', error);
      }
      setOnboardingComplete(false);
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="px-6 py-8 w-full pb-32">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!onboardingComplete) {
    return (
      <div className="px-6 py-8 w-full pb-32 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Deal</h1>
          <p className="text-muted-foreground">
            List a new property investment opportunity
          </p>
        </div>

        {/* Stripe Onboarding Required Alert */}
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong className="font-semibold">Stripe Onboarding Required</strong>
            <p className="mt-2">
              Before you can list deals, you must complete your Stripe Connect onboarding to receive payouts.
              This is a secure process managed by Stripe.
            </p>
          </AlertDescription>
        </Alert>

        <div className="bg-muted rounded-lg border border-border p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Why Stripe Connect?</h3>
              <p className="text-sm text-muted-foreground">
                Stripe Connect ensures secure and reliable payouts when your deals complete. You'll be able to
                receive your sourcing fees directly to your bank account.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Secure Payment Processing</p>
                  <p className="text-xs text-muted-foreground">Industry-leading security by Stripe</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Direct Bank Transfers</p>
                  <p className="text-xs text-muted-foreground">Receive payouts directly to your account</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Automated Payments</p>
                  <p className="text-xs text-muted-foreground">Get paid when deals complete</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => navigate('/dashboard/settings')}
                className="flex-1 cursor-pointer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Complete Stripe Onboarding
              </Button>
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="cursor-pointer"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 w-full pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Deal</h1>
        <p className="text-muted-foreground">
          List a new property investment opportunity
        </p>
      </div>

      <DealForm mode="create" />
    </div>
  );
}
