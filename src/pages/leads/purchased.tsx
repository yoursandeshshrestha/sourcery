import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { LeadPurchase, DansLead } from '@/types/lead';
import { formatDateTime } from '@/lib/date';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingBag,
  MapPin,
  Home,
  Phone,
  Mail,
  User,
  FileText,
  ArrowLeft,
  Copy,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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

interface PurchaseWithLead extends LeadPurchase {
  lead: DansLead;
}

export default function PurchasedLeadsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [purchases, setPurchases] = useState<PurchaseWithLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
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
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>(() => {
    return searchParams.get('types') || 'all';
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
    const typesParam = searchParams.get('types');
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort');
    const pageParam = searchParams.get('page');

    setPropertyTypeFilter(typesParam || 'all');
    setSearchQuery(searchParam || '');
    setDebouncedSearch(searchParam || '');
    setSortOrder((sortParam as 'newest' | 'oldest') || 'newest');
    setCurrentPage(pageParam ? parseInt(pageParam, 10) : 1);
  }, [searchParams]);

  // Set initial URL params if not present
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let updated = false;

    if (!searchParams.has('types')) {
      params.set('types', 'all');
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
    if (user) {
      fetchPurchases();
      fetchStats();
    }
  }, [currentPage, sortOrder, debouncedSearch, propertyTypeFilter, user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('lead_purchases')
        .select('*, lead:dans_leads!inner(*)', { count: 'exact', head: true })
        .eq('buyer_id', user.id);

      // Apply filters
      if (propertyTypeFilter !== 'all') {
        query = query.eq('lead.property_type', propertyTypeFilter);
      }

      if (debouncedSearch) {
        query = query.or(`lead.title.ilike.%${debouncedSearch}%,lead.location.ilike.%${debouncedSearch}%`);
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

  const fetchPurchases = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    try {
      setLoading(true);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('lead_purchases')
        .select(`
          *,
          lead:dans_leads(*)
        `)
        .eq('buyer_id', user.id);

      // Apply filters on the lead
      if (propertyTypeFilter !== 'all') {
        query = query.eq('lead.property_type', propertyTypeFilter);
      }

      if (debouncedSearch) {
        query = query.or(`lead.title.ilike.%${debouncedSearch}%,lead.location.ilike.%${debouncedSearch}%`);
      }

      query = query
        .order('created_at', { ascending: sortOrder === 'oldest' })
        .range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      setPurchases((data as PurchaseWithLead[]) || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching purchases:', error);
      }
      toast.error('Failed to load purchased leads');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error copying to clipboard:', error);
      }
      toast.error('Failed to copy');
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Purchased Leads</h1>
          <p className="text-muted-foreground">
            View all seller contacts you've purchased ({totalCount})
          </p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/leads')}
          variant="outline"
          className="cursor-pointer rounded-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Browse Leads
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
          value={propertyTypeFilter}
          onValueChange={(value) => {
            setPropertyTypeFilter(value);
            setCurrentPage(1);

            // Update URL
            const params = new URLSearchParams(searchParams);
            params.set('types', value);
            params.set('page', '1');
            setSearchParams(params);
          }}
        >
          <SelectTrigger className="w-[160px] cursor-pointer rounded-lg">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">All Types</SelectItem>
            <SelectItem value="House" className="cursor-pointer">House</SelectItem>
            <SelectItem value="Flat" className="cursor-pointer">Flat</SelectItem>
            <SelectItem value="Bungalow" className="cursor-pointer">Bungalow</SelectItem>
            <SelectItem value="Land" className="cursor-pointer">Land</SelectItem>
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
        {(searchQuery || propertyTypeFilter !== 'all') && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setDebouncedSearch('');
              setPropertyTypeFilter('all');
              setCurrentPage(1);

              // Reset URL params to defaults
              const params = new URLSearchParams();
              params.set('types', 'all');
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

      {/* Content */}
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner message="Loading purchased leads..." />
        </div>
      ) : purchases.length === 0 ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No purchased leads found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || propertyTypeFilter !== 'all'
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'Browse the marketplace to find motivated seller contacts.'}
            </p>
            {!searchQuery && propertyTypeFilter === 'all' && (
              <Button
                onClick={() => navigate('/dashboard/leads')}
                className="cursor-pointer rounded-lg"
              >
                Browse Leads
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {purchases.map((purchase) => {
              const lead = purchase.lead;
              const details = lead.full_details;

              return (
                <Card key={purchase.id} className="overflow-hidden bg-white dark:bg-card border rounded-xl">
                  {/* Thumbnail Image */}
                  {lead.thumbnail_url && (
                    <div className="aspect-16/10 overflow-hidden bg-muted">
                      <img
                        src={lead.thumbnail_url}
                        alt={lead.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    {/* Header */}
                    <div>
                      <h3 className="text-base font-semibold line-clamp-1 mb-1">{lead.title}</h3>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-sm truncate">{lead.location}</span>
                      </div>
                    </div>

                    {/* Seller Contact Details (Unlocked) */}
                    <div className="border border-border rounded-lg p-3 bg-muted/30 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Contact Details</span>
                      </div>

                      {/* Seller Name */}
                      {details.seller_name && (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <p className="text-xs font-medium truncate">{details.seller_name}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(details.seller_name, `name-${purchase.id}`)}
                            className="cursor-pointer shrink-0 h-6 w-6 p-0"
                          >
                            {copiedField === `name-${purchase.id}` ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Phone */}
                      {details.seller_phone && (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <a
                              href={`tel:${details.seller_phone}`}
                              className="text-xs font-medium text-primary hover:underline truncate cursor-pointer"
                            >
                              {details.seller_phone}
                            </a>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(details.seller_phone, `phone-${purchase.id}`)}
                            className="cursor-pointer shrink-0 h-6 w-6 p-0"
                          >
                            {copiedField === `phone-${purchase.id}` ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Email */}
                      {details.seller_email && (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <a
                              href={`mailto:${details.seller_email}`}
                              className="text-xs font-medium text-primary hover:underline truncate cursor-pointer"
                            >
                              {details.seller_email}
                            </a>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(details.seller_email, `email-${purchase.id}`)}
                            className="cursor-pointer shrink-0 h-6 w-6 p-0"
                          >
                            {copiedField === `email-${purchase.id}` ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Purchase Info */}
                    <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
                      <span className="truncate">£{purchase.amount.toFixed(0)}</span>
                      <Badge className="bg-green-600 text-white hover:bg-green-700 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Purchased
                      </Badge>
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
                Showing {startItem}-{endItem} of {totalCount} purchases
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
    </div>
  );
}
