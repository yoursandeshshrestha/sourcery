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
import { Loader2, Eye, Receipt, User, Mail, Building2 } from 'lucide-react';
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
    const variants: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      CONFIRMED: 'bg-green-100 text-green-700 border-green-300',
      CANCELLED: 'bg-red-100 text-red-700 border-red-300',
      COMPLETED: 'bg-purple-100 text-purple-700 border-purple-300',
    };

    return (
      <Badge variant="outline" className={variants[status] || variants.PENDING}>
        {RESERVATION_STATUS_LABELS[status as keyof typeof RESERVATION_STATUS_LABELS]}
      </Badge>
    );
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Reservations</p>
          <p className="text-2xl font-bold">{reservations.length}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">
            {reservations.filter((r) => r.status === 'CONFIRMED').length}
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-2xl font-bold text-purple-600">
            {reservations.filter((r) => r.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
          <p className="text-2xl font-bold">
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
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investor</TableHead>
                <TableHead>Deal</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Reservation Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reserved On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={reservation.investor?.avatar_url || undefined} />
                        <AvatarFallback>
                          {reservation.investor
                            ? getInitials(
                                reservation.investor.first_name,
                                reservation.investor.last_name
                              )
                            : 'IN'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
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
                  </TableCell>
                  <TableCell className="font-medium">
                    {reservation.deal?.headline || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {reservation.deal?.strategy_type
                        ? STRATEGY_LABELS[
                            reservation.deal.strategy_type as keyof typeof STRATEGY_LABELS
                          ]
                        : 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(reservation.reservation_fee_amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(reservation.reserved_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(reservation)}
                        className="cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
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

            <div className="space-y-4">
              {/* Investor Info */}
              <div className="rounded-md border border-border bg-muted p-4">
                <h3 className="font-semibold mb-3">Investor Information</h3>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedReservation.investor?.avatar_url || undefined} />
                    <AvatarFallback>
                      {selectedReservation.investor
                        ? getInitials(
                            selectedReservation.investor.first_name,
                            selectedReservation.investor.last_name
                          )
                        : 'IN'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedReservation.investor
                        ? `${selectedReservation.investor.first_name} ${selectedReservation.investor.last_name}`
                        : 'N/A'}
                    </p>
                    {selectedReservation.investor?.company_name && (
                      <p className="text-sm text-muted-foreground">
                        {selectedReservation.investor.company_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{selectedReservation.investor?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Deal Info */}
              <div className="rounded-md border border-border bg-muted p-4">
                <h3 className="font-semibold mb-3">Deal Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property</span>
                    <span className="font-medium">{selectedReservation.deal?.headline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">
                      {selectedReservation.deal?.approximate_location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Strategy</span>
                    <Badge variant="outline">
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
              <div className="rounded-md border border-border bg-muted p-4">
                <h3 className="font-semibold mb-3">Reservation Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {getStatusBadge(selectedReservation.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reservation Fee</span>
                    <span className="font-semibold">
                      {formatCurrency(selectedReservation.reservation_fee_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reserved On</span>
                    <span className="font-medium">
                      {formatDateTime(selectedReservation.reserved_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Investor Notes */}
              {selectedReservation.investor_notes && (
                <div className="rounded-md border border-border bg-muted p-4">
                  <h3 className="font-semibold mb-2">Investor Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
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
