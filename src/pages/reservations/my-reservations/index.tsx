import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Reservation } from '@/types/reservation';
import { RESERVATION_STATUS_LABELS } from '@/types/reservation';
import { STRATEGY_LABELS } from '@/types/deal';
import { Loader2, Eye, X, Receipt, MapPin, User, Mail, Phone } from 'lucide-react';
import { formatDateTime } from '@/lib/date';
import { getPublicUrl } from '@/lib/storage';

export default function MyReservationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const hasShownPaymentToast = useRef(false);

  useEffect(() => {
    fetchMyReservations();
  }, []);

  // Handle payment success/cancellation
  useEffect(() => {
    const payment = searchParams.get('payment');

    // Prevent showing toast multiple times (e.g., in React StrictMode)
    if (hasShownPaymentToast.current) return;

    if (payment === 'success') {
      hasShownPaymentToast.current = true;
      // Show toast and refresh
      toast.success('Payment successful! Your reservation has been confirmed.');
      fetchMyReservations();
      // Remove query parameters after showing toast
      setSearchParams({}, { replace: true });
    } else if (payment === 'cancelled') {
      hasShownPaymentToast.current = true;
      toast.error('Payment was cancelled. Please try again if you wish to reserve this deal.');
      // Remove query parameters after showing toast
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const fetchMyReservations = async () => {
    try {
      setLoading(true);

      // First fetch reservations
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('*')
        .eq('investor_id', user?.id)
        .order('reserved_at', { ascending: false });

      if (reservationsError) {
        throw reservationsError;
      }

      // Then fetch deals and sourcer info for each reservation
      const reservationsWithDeals = await Promise.all(
        (reservationsData || []).map(async (reservation) => {
          const { data: dealData } = await supabase
            .from('deals')
            .select('id, headline, approximate_location, strategy_type, thumbnail_url')
            .eq('id', reservation.deal_id)
            .maybeSingle();

          // Convert storage path to public URL if thumbnail_url exists
          let thumbnailUrl = dealData?.thumbnail_url;
          if (thumbnailUrl && !thumbnailUrl.startsWith('http')) {
            thumbnailUrl = getPublicUrl('deal-images', thumbnailUrl);
          }

          // Fetch sourcer contact info
          const { data: sourcerData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, phone, company_name')
            .eq('id', reservation.sourcer_id)
            .maybeSingle();


          return {
            ...reservation,
            deal: dealData ? { ...dealData, thumbnail_url: thumbnailUrl } : null,
            sourcer: sourcerData || null,
          };
        })
      );

      setReservations(reservationsWithDeals);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching reservations:', error);
      }
      toast.error('Failed to load your reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (reservation: Reservation) => {
    setReservationToCancel(reservation);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!reservationToCancel) return;

    try {
      setCancelling(true);

      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'CANCELLED',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', reservationToCancel.id);

      if (error) throw error;

      toast.success('Reservation cancelled');
      await fetchMyReservations();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error cancelling reservation:', error);
      }
      toast.error('Failed to cancel reservation');
    } finally {
      setCancelling(false);
      setCancelDialogOpen(false);
      setReservationToCancel(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-emerald-100 text-emerald-700',
      CANCELLED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-purple-100 text-purple-700',
    };

    return variants[status] || variants.PENDING;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1287ff]" />
      </div>
    );
  }

  return (
    <>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#1A1A1A] dark:text-gray-100">My Reservations</h1>
          <p className="text-sm text-[#6B6B6B] dark:text-gray-400 mt-1">Manage your deal reservations</p>
        </div>
      {/* Reservations */}
      {reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-[#E9E6DF] dark:border-border rounded-2xl bg-white dark:bg-card">
          <Receipt className="h-16 w-16 text-[#C5C0B8] mb-4" />
          <p className="text-xl font-semibold mb-2 text-[#1A1A1A] dark:text-gray-100">No reservations yet</p>
          <p className="text-[#6B6B6B] dark:text-gray-400 mb-6">
            Browse deals and reserve one to get started
          </p>
          <button
            onClick={() => navigate('/deals')}
            className="px-6 py-3 bg-[#1287ff] text-white rounded-xl font-semibold hover:bg-[#0A6FE6] transition-colors cursor-pointer"
          >
            Browse Deals
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="bg-white dark:bg-card border-2 border-[#E9E6DF] dark:border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="flex">
                {/* Thumbnail */}
                <div className="w-64 h-48 bg-[#F9F7F4] dark:bg-gray-800 shrink-0 relative">
                  {reservation.deal?.thumbnail_url ? (
                    <>
                      <img
                        src={reservation.deal.thumbnail_url}
                        alt={reservation.deal.headline}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Receipt className="h-12 w-12 text-[#C5C0B8]" />
                    </div>
                  )}
                  {/* Strategy Badge */}
                  {reservation.deal?.strategy_type && (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-card/95 backdrop-blur-sm text-[#1A1A1A] dark:text-gray-100 shadow-sm">
                        {STRATEGY_LABELS[reservation.deal.strategy_type as keyof typeof STRATEGY_LABELS]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xl text-[#1A1A1A] dark:text-gray-100 mb-2 line-clamp-2">
                        {reservation.deal?.headline || 'Deal Unavailable'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-[#6B6B6B] dark:text-gray-400">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span>{reservation.deal?.approximate_location || 'N/A'}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${getStatusColor(reservation.status)}`}>
                      {RESERVATION_STATUS_LABELS[reservation.status as keyof typeof RESERVATION_STATUS_LABELS]}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-6 pb-5 border-b border-[#E9E6DF] dark:border-border">
                    <div>
                      <p className="text-xs font-medium text-[#6B6B6B] dark:text-gray-400 mb-1 uppercase tracking-wide">Reservation Fee</p>
                      <p className="font-bold text-lg text-[#1287ff]">{formatCurrency(reservation.reservation_fee_amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#6B6B6B] dark:text-gray-400 mb-1 uppercase tracking-wide">Reserved On</p>
                      <p className="text-sm font-medium text-[#1A1A1A] dark:text-gray-100">{formatDateTime(reservation.reserved_at)}</p>
                    </div>
                  </div>

                  {/* Sourcer Contact Info - Only show for confirmed reservations */}
                  {reservation.status === 'CONFIRMED' && reservation.sourcer && (
                    <div className="mt-5 pb-5 border-b border-[#E9E6DF] dark:border-border">
                      <p className="text-xs font-semibold text-[#6B6B6B] dark:text-gray-400 mb-3 uppercase tracking-wide">Sourcer Contact</p>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 text-sm">
                          <User className="h-4 w-4 text-[#1287ff] shrink-0" />
                          <span className="font-semibold text-[#1A1A1A] dark:text-gray-100">
                            {reservation.sourcer.first_name} {reservation.sourcer.last_name}
                          </span>
                          {reservation.sourcer.company_name && (
                            <>
                              <span className="text-[#C5C0B8]">•</span>
                              <span className="text-[#6B6B6B] dark:text-gray-400">{reservation.sourcer.company_name}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 text-sm">
                          <Mail className="h-4 w-4 text-[#1287ff] shrink-0" />
                          <a
                            href={`mailto:${reservation.sourcer.email}`}
                            className="text-[#1287ff] font-medium cursor-pointer"
                          >
                            {reservation.sourcer.email}
                          </a>
                        </div>
                        {(reservation.sourcer as any).phone && (
                          <div className="flex items-center gap-2.5 text-sm">
                            <Phone className="h-4 w-4 text-[#1287ff] shrink-0" />
                            <a
                              href={`tel:${(reservation.sourcer as any).phone}`}
                              className="text-[#1287ff] font-medium cursor-pointer"
                            >
                              {(reservation.sourcer as any).phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => window.open(`/deals/${reservation.deal_id}`, '_blank')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#1287ff] text-white rounded-xl text-sm font-semibold cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      View Deal
                    </button>
                    {(reservation.status === 'CONFIRMED' || reservation.status === 'PENDING') && (
                      <button
                        onClick={() => handleCancelClick(reservation)}
                        className="flex items-center gap-2 px-5 py-2.5 border-2 border-red-200 text-red-600 rounded-xl text-sm font-semibold cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {cancelDialogOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => !cancelling && setCancelDialogOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-card rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-semibold text-[#1A1A1A] dark:text-gray-100 mb-2">Cancel Reservation</h2>
              <p className="text-[#6B6B6B] dark:text-gray-400 mb-6">
                Are you sure you want to cancel your reservation for{' '}
                <span className="font-medium text-[#1A1A1A] dark:text-gray-100">"{reservationToCancel?.deal?.headline}"</span>? This
                action cannot be undone and the deal will become available to other investors.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelDialogOpen(false)}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2.5 border border-[#E9E6DF] dark:border-border hover:bg-[#F9F7F4] dark:bg-gray-800 text-[#1A1A1A] dark:text-gray-100 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  Keep Reservation
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={cancelling}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Reservation'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
