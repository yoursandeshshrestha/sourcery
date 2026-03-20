import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Reservation } from '@/types/reservation';
import { RESERVATION_STATUS_LABELS } from '@/types/reservation';
import { STRATEGY_LABELS } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Receipt, Building2, Clock, CheckCircle2, XCircle, BadgeCheck, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateTime } from '@/lib/date';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { debounce } from '@/lib/utils';

export default function DealReservationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const [totalCount, setTotalCount] = useState(0);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>(() => {
    return (searchParams.get('sort') as 'newest' | 'oldest') || 'newest';
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.get('search') || '';
  });
  const [debouncedSearch, setDebouncedSearch] = useState(() => {
    return searchParams.get('search') || '';
  });
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    return searchParams.get('status') || 'all';
  });
  const ITEMS_PER_PAGE = 20;

  // Debounced search function
  const debouncedSearchRef = useRef(
    debounce((value: string) => {
      setDebouncedSearch(value);
    }, 500)
  );

  useEffect(() => {
    debouncedSearchRef.current = debounce((value: string) => {
      setDebouncedSearch(value);
    }, 500);
  }, []);

  // Sync all filters from URL params
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort');
    const pageParam = searchParams.get('page');

    setStatusFilter(statusParam || 'all');
    setSearchQuery(searchParam || '');
    setDebouncedSearch(searchParam || '');
    setSortOrder((sortParam as 'newest' | 'oldest') || 'newest');
    setCurrentPage(pageParam ? parseInt(pageParam, 10) : 1);
  }, [searchParams]);

  // Set initial URL params if not present
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let updated = false;

    if (!searchParams.has('status')) {
      params.set('status', 'all');
      updated = true;
    }
    if (!searchParams.has('search')) {
      params.set('search', '');
      updated = true;
    }
    if (!searchParams.has('sort')) {
      params.set('sort', 'newest');
      updated = true;
    }
    if (!searchParams.has('page')) {
      params.set('page', '1');
      updated = true;
    }

    if (updated) {
      setSearchParams(params, { replace: true });
    }
  }, []);

  useEffect(() => {
    fetchDealReservations();
    fetchStats();
  }, [currentPage, sortOrder, debouncedSearch, statusFilter]);

  const fetchStats = async () => {
    try {
      let query = supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('sourcer_id', user?.id);

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (debouncedSearch) {
        query = query.or(`deal.headline.ilike.%${debouncedSearch}%,investor.first_name.ilike.%${debouncedSearch}%,investor.last_name.ilike.%${debouncedSearch}%`);
      }

      const { count, error } = await query;

      if (error) throw error;
      setTotalCount(count || 0);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching stats:', error);
      }
    }
  };

  const fetchDealReservations = async () => {
    try {
      setLoading(true);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
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
        .eq('sourcer_id', user?.id);

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (debouncedSearch) {
        query = query.or(`deal.headline.ilike.%${debouncedSearch}%,investor.first_name.ilike.%${debouncedSearch}%,investor.last_name.ilike.%${debouncedSearch}%`);
      }

      query = query
        .order('reserved_at', { ascending: sortOrder === 'oldest' })
        .range(from, to);

      const { data, error } = await query;

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
    navigate(`/dashboard/reservations/${reservation.id}`);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2">Deal Reservations</h1>
        <p className="text-muted-foreground">
          View and manage reservations for your property deals ({totalCount})
        </p>
      </div>

      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner message="Loading reservations..." />
        </div>
      ) : (
        <>
          {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Reservations</p>
          <p className="text-3xl font-bold">{totalCount}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800 p-5">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2">Confirmed</p>
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
            {reservations.filter((r) => r.status === 'CONFIRMED').length}
          </p>
        </div>
        <div className="rounded-xl border border-violet-200 bg-violet-50 dark:bg-violet-950 dark:border-violet-800 p-5">
          <p className="text-sm font-medium text-violet-700 dark:text-violet-400 mb-2">Completed</p>
          <p className="text-3xl font-bold text-violet-700 dark:text-violet-400">
            {reservations.filter((r) => r.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
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

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by investor or deal..."
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              setCurrentPage(1);
              debouncedSearchRef.current(value);
              const params = new URLSearchParams(searchParams);
              params.set('search', value);
              params.set('page', '1');
              setSearchParams(params);
            }}
            className="pl-9 rounded-lg"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
            const params = new URLSearchParams(searchParams);
            params.set('status', value);
            params.set('page', '1');
            setSearchParams(params);
          }}
        >
          <SelectTrigger className="w-[160px] cursor-pointer rounded-lg">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={(value) => {
            setSortOrder(value as 'newest' | 'oldest');
            setCurrentPage(1);
            const params = new URLSearchParams(searchParams);
            params.set('sort', value);
            params.set('page', '1');
            setSearchParams(params);
          }}
        >
          <SelectTrigger className="w-[140px] cursor-pointer rounded-lg">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
        {(searchQuery || statusFilter !== 'all') && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setDebouncedSearch('');
              setStatusFilter('all');
              setCurrentPage(1);
              const params = new URLSearchParams(searchParams);
              params.set('search', '');
              params.set('status', 'all');
              params.set('page', '1');
              setSearchParams(params);
            }}
            className="cursor-pointer rounded-lg"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Reservations Table */}
      {reservations.length === 0 ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No reservations yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Reservations for your deals will appear here
            </p>
            <Button onClick={() => navigate('/dashboard/my-deals')} className="cursor-pointer rounded-lg">
              View My Deals
            </Button>
          </div>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow
                  key={reservation.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => handleViewDetails(reservation)}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
                        <span className="text-xs font-semibold text-primary">
                          {reservation.investor
                            ? getInitials(
                                reservation.investor.first_name,
                                reservation.investor.last_name
                              )
                            : 'IN'}
                        </span>
                      </div>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalCount > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} reservations
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    const params = new URLSearchParams(searchParams);
                    params.set('page', newPage.toString());
                    setSearchParams(params);
                  }}
                  disabled={currentPage === 1}
                  className="cursor-pointer rounded-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    const params = new URLSearchParams(searchParams);
                    params.set('page', newPage.toString());
                    setSearchParams(params);
                  }}
                  disabled={currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE)}
                  className="cursor-pointer rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
}
