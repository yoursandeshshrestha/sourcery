import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Reservation } from '@/types/reservation';
import { RESERVATION_STATUS_LABELS } from '@/types/reservation';
import { STRATEGY_LABELS } from '@/types/deal';
import { Loader2, Eye, X, Receipt, MapPin, User, Mail, Phone, Building2 } from 'lucide-react';
import { formatDateTime } from '@/lib/date';

export default function MyReservationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchMyReservations();
  }, []);

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
        if (import.meta.env.DEV) {
          console.error('Reservations query error:', reservationsError);
        }
        throw reservationsError;
      }

      if (import.meta.env.DEV) {
        console.log('Reservations:', reservationsData);
      }

      // Then fetch deals and sourcer info for each reservation
      const reservationsWithDeals = await Promise.all(
        (reservationsData || []).map(async (reservation) => {
          const { data: dealData, error: dealError } = await supabase
            .from('deals')
            .select('id, headline, approximate_location, strategy_type, thumbnail_url')
            .eq('id', reservation.deal_id)
            .maybeSingle();

          if (dealError && import.meta.env.DEV) {
            console.error('Deal query error for deal_id', reservation.deal_id, ':', dealError);
          }

          if (!dealData && import.meta.env.DEV) {
            console.warn('No deal found for deal_id:', reservation.deal_id, 'This could be an RLS issue');
          }

          // Fetch sourcer contact info
          const { data: sourcerData, error: sourcerError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, phone, company_name')
            .eq('id', reservation.sourcer_id)
            .maybeSingle();

          if (sourcerError && import.meta.env.DEV) {
            console.error('Sourcer query error for sourcer_id', reservation.sourcer_id, ':', sourcerError);
          }

          if (!sourcerData && import.meta.env.DEV) {
            console.warn('No sourcer found for sourcer_id:', reservation.sourcer_id);
          }

          return {
            ...reservation,
            deal: dealData || null,
            sourcer: sourcerData || null,
          };
        })
      );

      if (import.meta.env.DEV) {
        console.log('Reservations with deals:', reservationsWithDeals);
      }

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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">My Reservations</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">Manage your deal reservations</p>
      </div>
      {/* Reservations */}
      {reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-[#E9E6DF] rounded-2xl bg-white">
          <Receipt className="h-16 w-16 text-[#C5C0B8] mb-4" />
          <p className="text-xl font-semibold mb-2 text-[#1A1A1A]">No reservations yet</p>
          <p className="text-[#6B6B6B] mb-6">
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
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="bg-white border border-[#E9E6DF] rounded-2xl p-5 hover:border-[#1287ff] transition-colors">
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="w-32 h-24 rounded-xl overflow-hidden bg-[#F9F7F4] shrink-0">
                  {reservation.deal?.thumbnail_url ? (
                    <img
                      src={reservation.deal.thumbnail_url}
                      alt={reservation.deal.headline}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Receipt className="h-8 w-8 text-[#C5C0B8]" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-[#1A1A1A] line-clamp-1 mb-1">
                        {reservation.deal?.headline || 'Deal Unavailable'}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-[#6B6B6B]">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{reservation.deal?.approximate_location || 'N/A'}</span>
                        </div>
                        {reservation.deal?.strategy_type && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F9F7F4] text-[#1A1A1A]">
                            {STRATEGY_LABELS[reservation.deal.strategy_type as keyof typeof STRATEGY_LABELS]}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${getStatusColor(reservation.status)}`}>
                      {RESERVATION_STATUS_LABELS[reservation.status as keyof typeof RESERVATION_STATUS_LABELS]}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#E9E6DF]">
                    <div>
                      <p className="text-xs text-[#6B6B6B] mb-0.5">Reservation Fee</p>
                      <p className="font-semibold text-[#1A1A1A]">{formatCurrency(reservation.reservation_fee_amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B6B6B] mb-0.5">Reserved On</p>
                      <p className="text-sm text-[#1A1A1A]">{formatDateTime(reservation.reserved_at)}</p>
                    </div>
                  </div>

                  {/* Sourcer Contact Info - Only show for confirmed reservations */}
                  {reservation.status === 'CONFIRMED' && reservation.sourcer && (
                    <div className="mt-4 pt-4 border-t border-[#E9E6DF]">
                      <p className="text-xs font-semibold text-[#6B6B6B] mb-3 uppercase tracking-wide">Contact Sourcer</p>
                      <div className="bg-[#F9F7F4] rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-[#1287ff] shrink-0" />
                          <span className="font-medium text-[#1A1A1A]">
                            {reservation.sourcer.first_name} {reservation.sourcer.last_name}
                          </span>
                        </div>
                        {reservation.sourcer.company_name && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-[#1287ff] shrink-0" />
                            <span className="text-[#6B6B6B]">{reservation.sourcer.company_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-[#1287ff] shrink-0" />
                          <a
                            href={`mailto:${reservation.sourcer.email}`}
                            className="text-[#1287ff] hover:text-[#0A6FE6] hover:underline cursor-pointer"
                          >
                            {reservation.sourcer.email}
                          </a>
                        </div>
                        {reservation.sourcer.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-[#1287ff] shrink-0" />
                            <a
                              href={`tel:${reservation.sourcer.phone}`}
                              className="text-[#1287ff] hover:text-[#0A6FE6] hover:underline cursor-pointer"
                            >
                              {reservation.sourcer.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => window.open(`/deals/${reservation.deal_id}`, '_blank')}
                      className="flex items-center gap-2 px-4 py-2 border border-[#E9E6DF] hover:border-[#1287ff] text-[#1A1A1A] hover:text-[#1287ff] rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      View Deal
                    </button>
                    {(reservation.status === 'CONFIRMED' || reservation.status === 'PENDING') && (
                      <button
                        onClick={() => handleCancelClick(reservation)}
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 hover:border-red-400 text-red-600 hover:text-red-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelDialogOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => !cancelling && setCancelDialogOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">Cancel Reservation</h2>
              <p className="text-[#6B6B6B] mb-6">
                Are you sure you want to cancel your reservation for{' '}
                <span className="font-medium text-[#1A1A1A]">"{reservationToCancel?.deal?.headline}"</span>? This
                action cannot be undone and the deal will become available to other investors.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelDialogOpen(false)}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2.5 border border-[#E9E6DF] hover:bg-[#F9F7F4] text-[#1A1A1A] rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
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
