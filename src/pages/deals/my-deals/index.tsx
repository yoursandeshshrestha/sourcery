import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Deal } from '@/types/deal';
import { STATUS_LABELS, STRATEGY_LABELS } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
import {
  Loader2,
  Plus,
  Edit,
  Eye,
  Building2,
  Trash2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Home,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { debounce } from '@/lib/utils';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function MyDealsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({});
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
  const [strategyFilter, setStrategyFilter] = useState<string>(() => {
    return searchParams.get('strategy') || 'all';
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
    const strategyParam = searchParams.get('strategy');
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort');
    const pageParam = searchParams.get('page');

    setStatusFilter(statusParam || 'all');
    setStrategyFilter(strategyParam || 'all');
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
    if (!searchParams.has('strategy')) {
      params.set('strategy', 'all');
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
    fetchMyDeals();
    fetchStats();
  }, [currentPage, sortOrder, debouncedSearch, statusFilter, strategyFilter]);

  const fetchStats = async () => {
    try {
      let query = supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('sourcer_id', user?.id);

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (strategyFilter !== 'all') {
        query = query.eq('strategy_type', strategyFilter);
      }

      if (debouncedSearch) {
        query = query.or(`headline.ilike.%${debouncedSearch}%,approximate_location.ilike.%${debouncedSearch}%`);
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

  const fetchMyDeals = async () => {
    try {
      setLoading(true);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('deals')
        .select('*')
        .eq('sourcer_id', user?.id);

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (strategyFilter !== 'all') {
        query = query.eq('strategy_type', strategyFilter);
      }

      if (debouncedSearch) {
        query = query.or(`headline.ilike.%${debouncedSearch}%,approximate_location.ilike.%${debouncedSearch}%`);
      }

      query = query
        .order('created_at', { ascending: sortOrder === 'oldest' })
        .range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      setDeals(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching deals:', error);
      }
      toast.error('Failed to load your deals');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (deal: Deal) => {
    setDealToDelete(deal);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!dealToDelete) return;

    try {
      setDeleting(true);

      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealToDelete.id);

      if (error) throw error;

      toast.success('Deal deleted successfully');

      setDeleteDialogOpen(false);
      setDealToDelete(null);

      // Refresh stats
      await fetchStats();

      // If we're deleting the last item on a page that's not page 1, go to previous page
      if (deals.length === 1 && currentPage > 1) {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);

        // Update URL
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        setSearchParams(params);
      } else {
        // Refetch current page to get updated data
        await fetchMyDeals();
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error deleting deal:', error);
      }
      toast.error('Failed to delete deal');
    } finally {
      setDeleting(false);
    }
  };

  const handleNextImage = (dealId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndices(prev => ({
      ...prev,
      [dealId]: ((prev[dealId] || 0) + 1) % totalImages
    }));
  };

  const handlePrevImage = (dealId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndices(prev => ({
      ...prev,
      [dealId]: ((prev[dealId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const getDealImages = (deal: Deal): string[] => {
    return deal.media_urls || [];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">My Deals</h1>
          <p className="text-muted-foreground">
            Manage your property listings ({totalCount})
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/deals/create')} className="cursor-pointer rounded-lg">
          <Plus className="h-4 w-4 mr-2" />
          Create Deal
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or location..."
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                setCurrentPage(1);

                // Debounce the actual search
                debouncedSearchRef.current(value);

                // Update URL immediately for UX
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

              // Update URL
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
              <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
              <SelectItem value="ACTIVE" className="cursor-pointer">Active</SelectItem>
              <SelectItem value="DRAFT" className="cursor-pointer">Draft</SelectItem>
              <SelectItem value="RESERVED" className="cursor-pointer">Reserved</SelectItem>
              <SelectItem value="COMPLETED" className="cursor-pointer">Completed</SelectItem>
              <SelectItem value="CANCELLED" className="cursor-pointer">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={strategyFilter}
            onValueChange={(value) => {
              setStrategyFilter(value);
              setCurrentPage(1);

              // Update URL
              const params = new URLSearchParams(searchParams);
              params.set('strategy', value);
              params.set('page', '1');
              setSearchParams(params);
            }}
          >
            <SelectTrigger className="w-[160px] cursor-pointer rounded-lg">
              <SelectValue placeholder="Strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">All Strategies</SelectItem>
              <SelectItem value="FLIP" className="cursor-pointer">Flip</SelectItem>
              <SelectItem value="HMO" className="cursor-pointer">HMO</SelectItem>
              <SelectItem value="R2R" className="cursor-pointer">Rent-to-Rent</SelectItem>
              <SelectItem value="BTL" className="cursor-pointer">Buy-to-Let</SelectItem>
              <SelectItem value="BRRR" className="cursor-pointer">BRRR</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortOrder}
            onValueChange={(value) => {
              setSortOrder(value as 'newest' | 'oldest');
              setCurrentPage(1);

              // Update URL
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
              <SelectItem value="newest" className="cursor-pointer">Newest</SelectItem>
              <SelectItem value="oldest" className="cursor-pointer">Oldest</SelectItem>
            </SelectContent>
          </Select>
          {(searchQuery || statusFilter !== 'all' || strategyFilter !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setDebouncedSearch('');
                setStatusFilter('all');
                setStrategyFilter('all');
                setCurrentPage(1);

                // Reset URL params to defaults
                const params = new URLSearchParams();
                params.set('status', 'all');
                params.set('strategy', 'all');
                params.set('search', '');
                params.set('sort', 'newest');
                params.set('page', '1');
                setSearchParams(params);
              }}
              className="cursor-pointer whitespace-nowrap rounded-lg"
            >
              Clear filters
            </Button>
          )}
      </div>

      {/* Deals Grid */}
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner message="Loading deals..." />
        </div>
      ) : totalCount === 0 ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No deals found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all' || strategyFilter !== 'all'
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'Create your first deal to start listing properties.'}
            </p>
            {!searchQuery && statusFilter === 'all' && strategyFilter === 'all' && (
              <Button
                onClick={() => navigate('/dashboard/deals/create')}
                className="cursor-pointer rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Deal
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {deals.map((deal) => {
              const images = getDealImages(deal);
              const currentIndex = imageIndices[deal.id] || 0;
              const hasMultipleImages = images.length > 1;

              return (
                <Card
                  key={deal.id}
                  className="overflow-hidden bg-white dark:bg-card border rounded-xl"
                >
                  {/* Image Slider */}
                  <div className="relative aspect-16/10 overflow-hidden bg-gray-50 group">
                    {images.length > 0 ? (
                      <img
                        src={images[currentIndex]}
                        alt={deal.headline}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-12 w-12 text-gray-300" />
                      </div>
                    )}

                    {/* Navigation Arrows */}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={(e) => handlePrevImage(deal.id, images.length, e)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                          type="button"
                        >
                          <ChevronLeft className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => handleNextImage(deal.id, images.length, e)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                          type="button"
                        >
                          <ChevronRight className="h-4 w-4 text-gray-700" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-1.5 rounded-full transition-all ${
                                idx === currentIndex
                                  ? 'w-4 bg-white'
                                  : 'w-1.5 bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          deal.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800'
                            : deal.status === 'RESERVED'
                            ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-800'
                            : deal.status === 'DRAFT'
                            ? 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-800'
                            : 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-800'
                        }`}
                      >
                        {STATUS_LABELS[deal.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Title and Location */}
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
                        {deal.headline}
                      </h3>
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-sm truncate">{deal.approximate_location}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 pt-1">
                      <span>{deal.view_count || 0} views</span>
                      <span className="text-gray-400 dark:text-gray-500">•</span>
                      <span>{formatCurrency(deal.capital_required)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => navigate(`/dashboard/my-deals/${deal.id}/edit`)}
                        variant="outline"
                        size="sm"
                        className="flex-1 cursor-pointer h-8 text-sm rounded-lg"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => navigate(`/dashboard/deals/${deal.id}`)}
                        variant="outline"
                        size="sm"
                        className="cursor-pointer h-8 text-sm rounded-lg"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(deal)}
                        variant="outline"
                        size="sm"
                        className="cursor-pointer h-8 text-sm hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalCount > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between pt-6">
              <p className="text-sm text-muted-foreground">
                Showing {startItem}-{endItem} of {totalCount} deals
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.max(1, currentPage - 1);
                    setCurrentPage(newPage);

                    // Update URL
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
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.min(totalPages, currentPage + 1);
                    setCurrentPage(newPage);

                    // Update URL
                    const params = new URLSearchParams(searchParams);
                    params.set('page', newPage.toString());
                    setSearchParams(params);
                  }}
                  disabled={currentPage === totalPages}
                  className="cursor-pointer rounded-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium">"{dealToDelete?.headline}"</span>?{' '}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer rounded-lg" disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 cursor-pointer rounded-lg"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Deal'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
