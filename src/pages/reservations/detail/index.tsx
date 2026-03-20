import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Reservation } from '@/types/reservation';
import { RESERVATION_STATUS_LABELS } from '@/types/reservation';
import { STRATEGY_LABELS } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, User, Building2, Receipt, Clock, CheckCircle2, XCircle, BadgeCheck } from 'lucide-react';
import { formatDateTime } from '@/lib/date';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchReservation();
    }
  }, [id]);

  const fetchReservation = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('reservations')
        .select(
          `
          *,
          deal:deals!deal_id(
            headline,
            approximate_location,
            strategy_type,
            thumbnail_url,
            capital_required,
            description
          ),
          investor:profiles!investor_id(
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            company_name
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      setReservation(data);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching reservation:', error);
      }
      toast.error('Failed to load reservation details');
      navigate('/dashboard/reservations/deals');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: typeof Clock; className: string }> = {
      PENDING: {
        icon: Clock,
        className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
      },
      CONFIRMED: {
        icon: CheckCircle2,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
      },
      CANCELLED: {
        icon: XCircle,
        className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800',
      },
      COMPLETED: {
        icon: BadgeCheck,
        className: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
      },
    };

    const statusConfig = config[status] || config.PENDING;
    const Icon = statusConfig.icon;

    return (
      <Badge variant="outline" className={`${statusConfig.className} flex items-center gap-1.5 w-fit`}>
        <Icon className="h-3.5 w-3.5" />
        {RESERVATION_STATUS_LABELS[status as keyof typeof RESERVATION_STATUS_LABELS]}
      </Badge>
    );
  };

  const getStrategyBadgeClass = (strategy: string) => {
    const classes: Record<string, string> = {
      FLIP: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
      HMO: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800',
      R2R: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-400 dark:border-cyan-800',
      BTL: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
      BRRR: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
    };
    return classes[strategy] || 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800';
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="Loading reservation details..." />
      </div>
    );
  }

  if (!reservation) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/reservations/deals')}
          className="cursor-pointer rounded-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reservations
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Reservation Details</h1>
          <p className="text-muted-foreground">
            Reservation #{reservation.id.slice(0, 8)}
          </p>
        </div>
        {getStatusBadge(reservation.status)}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Card */}
          <div className="rounded-lg border border-border overflow-hidden bg-card">
            <div className="p-6">
              <div className="flex items-start gap-4">
                {reservation.deal?.thumbnail_url && (
                  <img
                    src={reservation.deal.thumbnail_url}
                    alt={reservation.deal.headline || 'Deal'}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-lg font-semibold">
                      {reservation.deal?.headline || 'N/A'}
                    </h2>
                    {reservation.deal?.strategy_type && (
                      <Badge
                        variant="outline"
                        className={`font-medium ${getStrategyBadgeClass(reservation.deal.strategy_type)}`}
                      >
                        {STRATEGY_LABELS[reservation.deal.strategy_type as keyof typeof STRATEGY_LABELS]}
                      </Badge>
                    )}
                  </div>
                  {reservation.deal?.approximate_location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      {reservation.deal.approximate_location}
                    </div>
                  )}
                  {reservation.deal?.capital_required && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      Capital Required: {formatCurrency(reservation.deal.capital_required)}
                    </div>
                  )}
                </div>
              </div>
              {reservation.deal?.description && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">{reservation.deal.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reservation Details */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Reservation Information</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Receipt className="h-4 w-4" />
                  <span>Reservation Fee</span>
                </div>
                <span className="font-semibold text-base">
                  {formatCurrency(reservation.reservation_fee_amount)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Reserved On</span>
                </div>
                <span className="text-sm">{formatDateTime(reservation.reserved_at)}</span>
              </div>
              {reservation.confirmed_at && (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirmed On</span>
                  </div>
                  <span className="text-sm">{formatDateTime(reservation.confirmed_at)}</span>
                </div>
              )}
              {reservation.cancelled_at && (
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    <span>Cancelled On</span>
                  </div>
                  <span className="text-sm">{formatDateTime(reservation.cancelled_at)}</span>
                </div>
              )}
              {reservation.completed_at && (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BadgeCheck className="h-4 w-4" />
                    <span>Completed On</span>
                  </div>
                  <span className="text-sm">{formatDateTime(reservation.completed_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Investor Information */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Investor</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
                <span className="text-sm font-semibold text-primary">
                  {reservation.investor
                    ? getInitials(
                        reservation.investor.first_name,
                        reservation.investor.last_name
                      )
                    : 'IN'}
                </span>
              </div>
              <div>
                <p className="font-medium">
                  {reservation.investor
                    ? `${reservation.investor.first_name} ${reservation.investor.last_name}`
                    : 'N/A'}
                </p>
                {reservation.investor?.company_name && (
                  <p className="text-xs text-muted-foreground">
                    {reservation.investor.company_name}
                  </p>
                )}
              </div>
            </div>
            {reservation.investor?.email && (
              <div className="pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="text-sm">{reservation.investor.email}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full cursor-pointer rounded-lg"
                onClick={() => navigate(`/dashboard/deals/${reservation.deal_id}`)}
              >
                View Deal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
