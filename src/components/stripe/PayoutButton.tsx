import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, BadgeCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { initiatePayoutTransfer } from '@/lib/stripe';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PayoutButtonProps {
  reservationId: string;
  reservationFeeAmount: number;
  sourcerName: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

export function PayoutButton({
  reservationId,
  reservationFeeAmount,
  sourcerName,
  onSuccess,
  disabled = false,
}: PayoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const platformCommission = reservationFeeAmount * 0.20;
  const sourcerPayout = reservationFeeAmount * 0.80;

  const handleInitiatePayout = async () => {
    try {
      setLoading(true);

      await initiatePayoutTransfer(reservationId);

      toast.success('Payout completed successfully!');
      setDialogOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error initiating payout:', error);
      }
      toast.error(error.message || 'Failed to initiate payout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        disabled={disabled || loading}
        className="w-full cursor-pointer"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing Payout...
          </>
        ) : (
          <>
            <BadgeCheck className="h-4 w-4 mr-2" />
            Authorize Payout
          </>
        )}
      </Button>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Authorize Payout</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You're about to authorize the payout for this completed deal. The sourcing fee will be
                transferred to the sourcer's account.
              </p>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reservation Fee</span>
                  <span className="font-medium">{formatCurrency(reservationFeeAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Commission (20%)</span>
                  <span className="font-medium">-{formatCurrency(platformCommission)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="font-medium">Sourcer Payout (80%)</span>
                  <span className="font-bold text-green-600">{formatCurrency(sourcerPayout)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-100">
                  <strong>Note:</strong> This action cannot be undone. The funds will be transferred to{' '}
                  {sourcerName}'s Stripe account immediately.
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                By authorizing this payout, you confirm that the deal has completed successfully and all
                conditions have been met.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleInitiatePayout}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Payout'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
