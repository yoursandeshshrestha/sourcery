import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Deal } from '@/types/deal';
import type { CreateReservationInput } from '@/types/reservation';
import { Loader2, AlertCircle, X } from 'lucide-react';

interface ReserveDialogProps {
  deal: Deal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ReserveDialog({ deal, open, onOpenChange, onSuccess }: ReserveDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleReserve = async () => {
    if (!user) {
      toast.error('You must be logged in to reserve a deal');
      return;
    }

    try {
      setLoading(true);

      const reservationData: CreateReservationInput = {
        deal_id: deal.id,
        investor_id: user.id,
        sourcer_id: deal.sourcer_id,
        reservation_fee_amount: deal.reservation_fee,
        investor_notes: notes.trim() || undefined,
        status: 'CONFIRMED', // Auto-confirm for now (no payment integration yet)
      };

      const { error } = await supabase.from('reservations').insert(reservationData);

      if (error) {
        // Check for unique constraint violation
        if (error.code === '23505') {
          toast.error('You have already reserved this deal');
          onOpenChange(false);
          return;
        }
        throw error;
      }

      toast.success('Deal reserved successfully!');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error reserving deal:', error);
      }
      toast.error('Failed to reserve deal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in"
        onClick={() => !loading && onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-[640px] w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4 border-b border-[#E9E6DF]">
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-1">Reserve This Deal</h2>
              <p className="text-sm text-[#6B6B6B]">
                You're about to reserve "{deal.headline}". This will lock the deal for you.
              </p>
            </div>
            <button
              onClick={() => !loading && onOpenChange(false)}
              disabled={loading}
              className="p-2 hover:bg-[#F9F7F4] rounded-full transition-colors cursor-pointer shrink-0 ml-4"
            >
              <X className="h-5 w-5 text-[#6B6B6B]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Deal Summary */}
            <div className="rounded-xl border border-[#E9E6DF] bg-[#F9F7F4] p-4">
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Property</span>
                  <span className="font-medium text-[#1A1A1A]">{deal.headline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Location</span>
                  <span className="font-medium text-[#1A1A1A]">{deal.approximate_location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Capital Required</span>
                  <span className="font-semibold text-[#1A1A1A]">{formatCurrency(deal.capital_required)}</span>
                </div>
                <div className="flex justify-between pt-2.5 border-t border-[#E9E6DF]">
                  <span className="text-[#6B6B6B]">Reservation Fee</span>
                  <span className="font-bold text-lg text-[#1287ff]">{formatCurrency(deal.reservation_fee)}</span>
                </div>
              </div>
            </div>

            {/* Payment Notice */}
            <div className="flex gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50">
              <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <strong className="font-semibold">Note:</strong> Payment integration is coming soon. For now, your reservation
                will be confirmed immediately. The sourcer will contact you regarding payment.
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                placeholder="Any questions or requirements you'd like to share with the sourcer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 text-sm border border-[#E9E6DF] rounded-xl focus:outline-none focus:border-[#1287ff] focus:ring-1 focus:ring-[#1287ff] transition-colors resize-none"
              />
              <p className="text-xs text-[#6B6B6B] mt-2">
                This message will be shared with the sourcer
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 pt-4 border-t border-[#E9E6DF]">
            <button
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-[#E9E6DF] text-[#1A1A1A] hover:bg-[#F9F7F4] text-sm font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleReserve}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1287ff] hover:bg-[#0A6FE6] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reserving...
                </>
              ) : (
                'Confirm Reservation'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
