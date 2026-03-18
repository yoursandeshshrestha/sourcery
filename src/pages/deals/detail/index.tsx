import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import type { Deal } from '@/types/deal';
import type { Reservation } from '@/types/reservation';
import { STRATEGY_LABELS, STRATEGY_DESCRIPTIONS } from '@/types/deal';
import { NDADialog } from '@/components/deals/NDADialog';
import { ReserveDialog } from '@/components/deals/ReserveDialog';
import {
  Loader2,
  ArrowLeft,
  MapPin,
  TrendingUp,
  Coins,
  Building2,
  Eye,
  Calendar,
  FileText,
  CheckCircle2,
  Mail,
  Phone,
  X,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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
import { formatDateTime } from '@/lib/date';

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [ndaDialogOpen, setNdaDialogOpen] = useState(false);
  const [ndaSignatureName, setNdaSignatureName] = useState<string>('');
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDeal();
      checkReservation();
    }
  }, [id]);

  const fetchDeal = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select(
          `
          *,
          sourcer:profiles!sourcer_id(
            id,
            first_name,
            last_name,
            avatar_url,
            company_name,
            email,
            phone
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Supabase error fetching deal:', error);
        }
        throw error;
      }

      if (!data) {
        toast.error('Deal not found');
        navigate('/deals');
        return;
      }

      setDeal(data);

      // Increment view count
      await supabase.rpc('increment_deal_views', { deal_id: id });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching deal:', error);
      }
      toast.error('Failed to load deal');
      navigate('/deals');
    } finally {
      setLoading(false);
    }
  };

  const checkReservation = async () => {
    if (!profile?.id || !id) return;

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('deal_id', id)
        .eq('investor_id', profile.id)
        .in('status', ['PENDING', 'CONFIRMED'])
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - not an error in this case
        throw error;
      }

      setReservation(data);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking reservation:', error);
      }
    }
  };

  const handleReservationSuccess = () => {
    checkReservation();
    fetchDeal(); // Refresh deal to get updated status

    // Redirect to reservations page
    setTimeout(() => {
      navigate('/account/reservations');
    }, 1000); // Small delay to let the toast show
  };

  const handleReserveClick = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setNdaDialogOpen(true);
  };

  const handleNDAAccept = (signatureName: string) => {
    // Store signature name and proceed to payment
    setNdaSignatureName(signatureName);
    setNdaDialogOpen(false);
    setReserveDialogOpen(true);
  };

  const handleCancelReservation = async () => {
    if (!reservation) return;

    try {
      setCancelling(true);

      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'CANCELLED',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', reservation.id);

      if (error) throw error;

      toast.success('Reservation cancelled successfully');

      // Refresh data
      await checkReservation();
      await fetchDeal();

      setCancelDialogOpen(false);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error cancelling reservation:', error);
      }
      toast.error('Failed to cancel reservation');
    } finally {
      setCancelling(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="w-full bg-[#F9F7F4] min-h-screen">
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-8">
          <Skeleton className="h-10 w-32 mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Image Skeleton */}
              <Skeleton className="aspect-video w-full rounded-2xl" />

              {/* Header Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-9 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>

              {/* Key Metrics Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-2xl border border-[#E9E6DF] bg-white p-4">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>

              {/* Description Skeleton */}
              <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6 space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Strategy Info Skeleton */}
              <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6 space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Sourcer Info Skeleton */}
              <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>

              {/* Fees Skeleton */}
              <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6 space-y-3">
                <Skeleton className="h-4 w-16 mb-4" />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>

              {/* Metadata Skeleton */}
              <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6 space-y-3">
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Action Button Skeleton */}
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return null;
  }

  const isOwnDeal = profile?.id === deal.sourcer_id;

  const isSourcerView = profile?.role === 'SOURCER' || profile?.role === 'ADMIN';

  return (
    <div className="w-full bg-[#F9F7F4] min-h-screen">
      <div className={`${isSourcerView ? 'w-full px-6' : 'max-w-7xl mx-auto px-6'} py-8`}>
      {/* Back Button */}
      <button
        onClick={() => navigate(isSourcerView ? '/dashboard/my-deals' : '/deals')}
        className="flex items-center gap-2 px-4 py-2 mb-6 text-sm text-[#1287ff] hover:text-[#0A6FE6] transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        {isSourcerView ? 'Back to My Deals' : 'Back to Deals'}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image - Only show if thumbnail exists */}
          {deal.thumbnail_url && (
            <div className="aspect-video rounded-2xl overflow-hidden border border-[#E9E6DF] bg-white">
              <img
                src={deal.thumbnail_url}
                alt={deal.headline}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#1A1A1A] border border-[#E9E6DF] mb-3">
                  {STRATEGY_LABELS[deal.strategy_type]}
                </span>
                <h1 className="text-3xl font-bold mb-2 text-[#1A1A1A]">{deal.headline}</h1>
                <div className="flex items-center gap-4 text-[#6B6B6B]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{deal.approximate_location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">{deal.view_count} views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#E9E6DF] bg-white p-4">
              <p className="text-sm text-[#6B6B6B] mb-1">Capital Required</p>
              <p className="text-xl font-bold text-[#1A1A1A]">{formatCurrency(deal.capital_required)}</p>
            </div>
            <div className="rounded-2xl border border-[#E9E6DF] bg-white p-4">
              <p className="text-sm text-[#6B6B6B] mb-1">ROI</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <p className="text-xl font-bold text-emerald-600">
                  {formatPercentage(deal.calculated_roi)}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#E9E6DF] bg-white p-4">
              <p className="text-sm text-[#6B6B6B] mb-1">Yield</p>
              <p className="text-xl font-bold text-[#1A1A1A]">{formatPercentage(deal.calculated_yield)}</p>
            </div>
            <div className="rounded-2xl border border-[#E9E6DF] bg-white p-4">
              <p className="text-sm text-[#6B6B6B] mb-1">ROCE</p>
              <p className="text-xl font-bold text-[#1A1A1A]">{formatPercentage(deal.calculated_roce)}</p>
            </div>
          </div>

          {/* Description */}
          {deal.description && (
            <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
              <h2 className="text-lg font-semibold mb-4 text-[#1A1A1A]">Description</h2>
              <p className="text-[#6B6B6B] whitespace-pre-wrap leading-relaxed">{deal.description}</p>
            </div>
          )}

          {/* Strategy Info */}
          <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
            <h2 className="text-lg font-semibold mb-4 text-[#1A1A1A]">Investment Strategy</h2>
            <p className="text-[#6B6B6B] leading-relaxed">
              {STRATEGY_DESCRIPTIONS[deal.strategy_type]}
            </p>
          </div>

          {/* Full Address - Only visible if reserved or own deal */}
          {(reservation || isOwnDeal) && (
            <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">Full Address</h2>
                {reservation && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Reserved
                  </span>
                )}
              </div>
              <div className="flex items-start gap-2 text-[#6B6B6B]">
                <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                <p className="font-medium">{deal.full_address}</p>
              </div>
              {reservation && (
                <p className="text-sm text-[#6B6B6B] mt-3">
                  This address is visible because you have reserved this deal.
                </p>
              )}
            </div>
          )}

          {/* Financial Breakdown */}
          <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
            <h2 className="text-lg font-semibold mb-4 text-[#1A1A1A]">Financial Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-[#E9E6DF]">
                <span className="text-[#6B6B6B]">Purchase Price</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {formatCurrency(deal.financial_metrics.purchase_price)}
                </span>
              </div>
              {deal.financial_metrics.refurb_costs && (
                <div className="flex justify-between py-2 border-b border-[#E9E6DF]">
                  <span className="text-[#6B6B6B]">Refurb Costs</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    {formatCurrency(deal.financial_metrics.refurb_costs)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-[#E9E6DF]">
                <span className="text-[#6B6B6B]">Total Investment</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {formatCurrency(deal.financial_metrics.total_investment)}
                </span>
              </div>
              {deal.financial_metrics.estimated_gdv && (
                <div className="flex justify-between py-2 border-b border-[#E9E6DF]">
                  <span className="text-[#6B6B6B]">Estimated GDV</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    {formatCurrency(deal.financial_metrics.estimated_gdv)}
                  </span>
                </div>
              )}
              {deal.financial_metrics.estimated_rental_income && (
                <div className="flex justify-between py-2 border-b border-[#E9E6DF]">
                  <span className="text-[#6B6B6B]">Estimated Rental Income</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    {formatCurrency(deal.financial_metrics.estimated_rental_income)}/mo
                  </span>
                </div>
              )}
              {deal.financial_metrics.estimated_profit && (
                <div className="flex justify-between py-2">
                  <span className="text-[#6B6B6B]">Estimated Profit</span>
                  <span className="font-semibold text-emerald-600">
                    {formatCurrency(deal.financial_metrics.estimated_profit)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sourcer Info */}
          {deal.sourcer && (
            <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
              <h3 className="text-sm font-medium text-[#6B6B6B] mb-4">Sourced By</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-[#1287ff] flex items-center justify-center text-white font-semibold">
                  {getInitials(deal.sourcer.first_name, deal.sourcer.last_name)}
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">
                    {deal.sourcer.first_name} {deal.sourcer.last_name}
                  </p>
                  {deal.sourcer.company_name && (
                    <p className="text-sm text-[#6B6B6B]">{deal.sourcer.company_name}</p>
                  )}
                </div>
              </div>

              {/* Contact Details - Only show if user has reserved */}
              {reservation && (
                <div className="pt-4 border-t border-[#E9E6DF] space-y-2">
                  <p className="text-xs font-semibold text-[#6B6B6B] mb-2 uppercase tracking-wide">Contact Details</p>
                  <a
                    href={`mailto:${deal.sourcer.email}`}
                    className="flex items-center gap-2 text-sm text-[#1287ff] hover:text-[#0A6FE6] hover:underline cursor-pointer"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{deal.sourcer.email}</span>
                  </a>
                  {deal.sourcer.phone && (
                    <a
                      href={`tel:${deal.sourcer.phone}`}
                      className="flex items-center gap-2 text-sm text-[#1287ff] hover:text-[#0A6FE6] hover:underline cursor-pointer"
                    >
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{deal.sourcer.phone}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Fees */}
          <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
            <h3 className="text-sm font-medium text-[#6B6B6B] mb-4">Fees</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[#6B6B6B]">Reservation Fee</span>
                <span className="font-semibold text-[#1A1A1A]">{formatCurrency(deal.reservation_fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6B6B6B]">Sourcing Fee</span>
                <span className="font-semibold text-[#1A1A1A]">{formatCurrency(deal.sourcing_fee)}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-2xl border border-[#E9E6DF] bg-white p-6">
            <h3 className="text-sm font-medium text-[#6B6B6B] mb-4">Deal Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-[#6B6B6B]">
                <Calendar className="h-4 w-4" />
                <span>Listed {formatDateTime(deal.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-[#6B6B6B]">
                <Eye className="h-4 w-4" />
                <span>{deal.view_count} total views</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {!isOwnDeal && !reservation && deal.status === 'ACTIVE' && (
            <button
              onClick={handleReserveClick}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#1287ff] hover:bg-[#0A6FE6] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Coins className="h-4 w-4" />
              Reserve This Deal
            </button>
          )}

          {!isOwnDeal && reservation && (reservation.status === 'CONFIRMED' || reservation.status === 'PENDING') && (
            <div className="space-y-3">
              <div className="w-full flex items-center justify-center gap-2 py-3 border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl">
                <CheckCircle2 className="h-4 w-4" />
                Reserved
              </div>
              <button
                onClick={() => setCancelDialogOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 hover:border-red-400 text-red-600 hover:text-red-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer bg-white"
              >
                <X className="h-4 w-4" />
                Cancel Reservation
              </button>
            </div>
          )}

          {!isOwnDeal && reservation && reservation.status === 'CANCELLED' && (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 py-3 border border-[#E9E6DF] text-[#6B6B6B] text-sm font-semibold rounded-xl bg-white cursor-not-allowed opacity-60"
            >
              Reservation Cancelled
            </button>
          )}

          {!isOwnDeal && deal.status === 'RESERVED' && !reservation && (
            <button
              disabled
              className="w-full py-3 border border-[#E9E6DF] text-[#6B6B6B] text-sm font-semibold rounded-xl bg-white cursor-not-allowed opacity-60"
            >
              Deal Reserved by Another Investor
            </button>
          )}

          {isOwnDeal && (
            <button
              onClick={() => navigate(`/dashboard/my-deals/${deal.id}/edit`)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-[#E9E6DF] hover:border-[#1287ff] text-[#1A1A1A] hover:text-[#1287ff] text-sm font-semibold rounded-xl transition-colors cursor-pointer bg-white"
            >
              <FileText className="h-4 w-4" />
              Edit Deal
            </button>
          )}
        </div>
      </div>

      {/* NDA Dialog - Shows first */}
      {!isOwnDeal && (
        <NDADialog
          deal={deal}
          open={ndaDialogOpen}
          onOpenChange={setNdaDialogOpen}
          onAccept={handleNDAAccept}
        />
      )}

      {/* Reserve Dialog - Shows after NDA is signed */}
      {!isOwnDeal && ndaSignatureName && (
        <ReserveDialog
          deal={deal}
          open={reserveDialogOpen}
          onOpenChange={setReserveDialogOpen}
          onSuccess={handleReservationSuccess}
          ndaSignatureName={ndaSignatureName}
        />
      )}

      {/* Cancel Reservation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your reservation for{' '}
              <span className="font-medium">"{deal.headline}"</span>?{' '}
              This action cannot be undone and the deal will become available to other investors.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={cancelling}>
              Keep Reservation
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelReservation}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Reservation'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}
