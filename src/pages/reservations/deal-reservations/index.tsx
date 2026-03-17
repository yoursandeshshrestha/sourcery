import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Reservation } from '@/types/reservation';
import { RESERVATION_STATUS_LABELS } from '@/types/reservation';
import { STRATEGY_LABELS } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Eye, Receipt, User, Mail, Building2, Clock, CheckCircle2, XCircle, BadgeCheck } from 'lucide-react';
import { formatDateTime } from '@/lib/date';

export default function DealReservationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    fetchDealReservations();
  }, []);

  const fetchDealReservations = async () => {
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
            thumbnail_url
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
        .eq('sourcer_id', user?.id)
        .order('reserved_at', { ascending: false });

      if (error) throw error;

      setReservations(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching reservations:', error);
      }
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDetailDialogOpen(true);
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Deal Reservations</h1>
        <p className="text-muted-foreground">
          View and manage reservations for your property deals
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-lg border border-border bg-card p-5 hover:shadow-sm transition-shadow">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Reservations</p>
          <p className="text-3xl font-bold">{reservations.length}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800 p-5 hover:shadow-sm transition-shadow">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2">Confirmed</p>
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
            {reservations.filter((r) => r.status === 'CONFIRMED').length}
          </p>
        </div>
        <div className="rounded-lg border border-violet-200 bg-violet-50 dark:bg-violet-950 dark:border-violet-800 p-5 hover:shadow-sm transition-shadow">
          <p className="text-sm font-medium text-violet-700 dark:text-violet-400 mb-2">Completed</p>
          <p className="text-3xl font-bold text-violet-700 dark:text-violet-400">
            {reservations.filter((r) => r.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 hover:shadow-sm transition-shadow">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-primary">
            {formatCurrency(
              reservations
                .filter((r) => r.status === 'COMPLETED')
                .reduce((sum, r) => sum + r.reservation_fee_amount, 0)
            )}
          </p>
        </div>
      </div>

      {/* Reservations Table */}
      {reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-border rounded-md">
          <Receipt className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium mb-1">No reservations yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Reservations for your deals will appear here
          </p>
          <Button onClick={() => navigate('/dashboard/my-deals')} className="cursor-pointer">
            View My Deals
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Investor</TableHead>
                <TableHead className="font-semibold">Deal</TableHead>
                <TableHead className="font-semibold">Strategy</TableHead>
                <TableHead className="font-semibold">Reservation Fee</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Reserved On</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id} className="hover:bg-muted/30">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-border">
                        <AvatarImage src={reservation.investor?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                          {reservation.investor
                            ? getInitials(
                                reservation.investor.first_name,
                                reservation.investor.last_name
                              )
                            : 'IN'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {reservation.investor
                            ? `${reservation.investor.first_name} ${reservation.investor.last_name}`
                            : 'N/A'}
                        </p>
                        {reservation.investor?.company_name && (
                          <p className="text-xs text-muted-foreground truncate">
                            {reservation.investor.company_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="max-w-[250px]">
                      <p className="font-medium text-sm truncate">
                        {reservation.deal?.headline || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {reservation.deal?.approximate_location || ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={`font-medium ${
                        reservation.deal?.strategy_type
                          ? getStrategyBadgeClass(reservation.deal.strategy_type)
                          : ''
                      }`}
                    >
                      {reservation.deal?.strategy_type
                        ? STRATEGY_LABELS[
                            reservation.deal.strategy_type as keyof typeof STRATEGY_LABELS
                          ]
                        : 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-semibold text-base">
                      {formatCurrency(reservation.reservation_fee_amount)}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell className="py-4 text-sm text-muted-foreground">
                    {formatDateTime(reservation.reserved_at)}
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(reservation)}
                      className="cursor-pointer hover:bg-primary/10 hover:text-primary"
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      <span className="text-xs font-medium">View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Reservation Detail Dialog */}
      {selectedReservation && (
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Reservation Details</DialogTitle>
              <DialogDescription>
                Full information about this reservation
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {/* Investor Info */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Investor Information
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-14 w-14 border-2 border-border">
                    <AvatarImage src={selectedReservation.investor?.avatar_url || undefined} />
                    <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                      {selectedReservation.investor
                        ? getInitials(
                            selectedReservation.investor.first_name,
                            selectedReservation.investor.last_name
                          )
                        : 'IN'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-base">
                      {selectedReservation.investor
                        ? `${selectedReservation.investor.first_name} ${selectedReservation.investor.last_name}`
                        : 'N/A'}
                    </p>
                    {selectedReservation.investor?.company_name && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {selectedReservation.investor.company_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground px-3 py-2 bg-muted/50 rounded-md">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="break-all">{selectedReservation.investor?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Deal Info */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Deal Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-muted-foreground font-medium">Property</span>
                    <span className="font-semibold text-right">{selectedReservation.deal?.headline}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-muted-foreground font-medium">Location</span>
                    <span className="font-medium text-right">
                      {selectedReservation.deal?.approximate_location}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-muted-foreground font-medium">Strategy</span>
                    <Badge
                      variant="outline"
                      className={`font-medium ${
                        selectedReservation.deal?.strategy_type
                          ? getStrategyBadgeClass(selectedReservation.deal.strategy_type)
                          : ''
                      }`}
                    >
                      {selectedReservation.deal?.strategy_type
                        ? STRATEGY_LABELS[
                            selectedReservation.deal
                              .strategy_type as keyof typeof STRATEGY_LABELS
                          ]
                        : 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Reservation Info */}
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  Reservation Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-muted-foreground font-medium">Status</span>
                    {getStatusBadge(selectedReservation.status)}
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-muted-foreground font-medium">Reservation Fee</span>
                    <span className="font-bold text-base text-primary">
                      {formatCurrency(selectedReservation.reservation_fee_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-muted-foreground font-medium">Reserved On</span>
                    <span className="font-medium text-right">
                      {formatDateTime(selectedReservation.reserved_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Investor Notes */}
              {selectedReservation.investor_notes && (
                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="font-semibold text-base mb-3">Investor Notes</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedReservation.investor_notes}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
