import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { DansLead } from '@/types/lead';
import { formatDateTime } from '@/lib/date';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
  Plus,
  Loader2,
  Edit,
  Trash2,
  MapPin,
  Home,
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

interface LeadWithStats extends DansLead {
  purchase_count?: number;
}

export default function AdminLeadsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [leads, setLeads] = useState<LeadWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingLead, setDeletingLead] = useState<DansLead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const [totalCount, setTotalCount] = useState(0);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>(() => {
    return searchParams.get('types') || 'all';
  });
  const ITEMS_PER_PAGE = 20;

  // Sync all filters from URL params
  useEffect(() => {
    const typesParam = searchParams.get('types');
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort');
    const pageParam = searchParams.get('page');

    setPropertyTypeFilter(typesParam || 'all');
    setSearchQuery(searchParam || '');
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
    fetchLeads();
    fetchStats();
  }, [currentPage, sortOrder, searchQuery, propertyTypeFilter]);

  const fetchStats = async () => {
    try {
      let query = supabase
        .from('dans_leads')
        .select('*', { count: 'exact', head: true });

      // Apply filters
      if (propertyTypeFilter !== 'all') {
        query = query.eq('property_type', propertyTypeFilter);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
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

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('dans_leads')
        .select('*');

      // Apply filters
      if (propertyTypeFilter !== 'all') {
        query = query.eq('property_type', propertyTypeFilter);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`);
      }

      query = query
        .order('created_at', { ascending: sortOrder === 'oldest' })
        .range(from, to);

      const { data: leadsData, error: leadsError } = await query;

      if (leadsError) throw leadsError;

      // Fetch purchase counts for each lead on this page
      const leadIds = (leadsData || []).map(lead => lead.id);

      if (leadIds.length > 0) {
        const { data: purchasesData, error: purchasesError } = await supabase
          .from('lead_purchases')
          .select('lead_id')
          .in('lead_id', leadIds);

        if (purchasesError) throw purchasesError;

        // Count purchases per lead
        const purchaseCounts = (purchasesData || []).reduce((acc: Record<string, number>, purchase) => {
          acc[purchase.lead_id] = (acc[purchase.lead_id] || 0) + 1;
          return acc;
        }, {});

        // Add purchase counts to leads
        const leadsWithStats = (leadsData || []).map((lead) => ({
          ...lead,
          purchase_count: purchaseCounts[lead.id] || 0,
        }));

        setLeads(leadsWithStats);
      } else {
        setLeads([]);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching leads:', error);
      }
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingLead) return;

    try {
      setDeleting(true);

      const { error } = await supabase
        .from('dans_leads')
        .delete()
        .eq('id', deletingLead.id);

      if (error) throw error;

      toast.success('Lead deleted successfully');

      // Remove from local state immediately for instant UI update
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== deletingLead.id));

      setDeletingLead(null);

      // Refresh stats in background
      fetchStats();

      // If we're deleting the last item on a page that's not page 1, go to previous page
      if (leads.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error deleting lead:', error);
      }
      toast.error('Failed to delete lead');
    } finally {
      setDeleting(false);
    }
  };

  const handleNextImage = (leadId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndices(prev => ({
      ...prev,
      [leadId]: ((prev[leadId] || 0) + 1) % totalImages
    }));
  };

  const handlePrevImage = (leadId: string, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setImageIndices(prev => ({
      ...prev,
      [leadId]: ((prev[leadId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const getLeadImages = (lead: DansLead): string[] => {
    if (lead.media_urls && lead.media_urls.length > 0) {
      return lead.media_urls;
    }
    if (lead.thumbnail_url) {
      return [lead.thumbnail_url];
    }
    return [];
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Dan's Leads Management</h1>
          <p className="text-muted-foreground">
            Create and manage motivated seller leads ({totalCount})
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/admin/leads/create')} className="cursor-pointer rounded-lg">
          <Plus className="h-4 w-4 mr-2" />
          Create Lead
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

              // Update URL
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
            size="sm"
            onClick={() => {
              setSearchQuery('');
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

      {/* Leads List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden bg-white border border-border rounded-xl">
              <Skeleton className="w-full aspect-16/10" />
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Home className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No leads found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchQuery || propertyTypeFilter !== 'all'
              ? 'Try adjusting your filters to find what you\'re looking for.'
              : 'Create your first lead to start selling motivated seller contacts.'}
          </p>
          {!searchQuery && propertyTypeFilter === 'all' && (
            <Button
              onClick={() => navigate('/dashboard/admin/leads/create')}
              className="cursor-pointer rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Lead
            </Button>
          )}
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {leads.map((lead) => {
              const images = getLeadImages(lead);
              const currentIndex = imageIndices[lead.id] || 0;
              const hasMultipleImages = images.length > 1;

              return (
                <Card
                  key={lead.id}
                  className="overflow-hidden bg-white border hover:border-gray-300 transition-colors rounded-xl"
                >
                  {/* Image Slider */}
                  <div className="relative aspect-16/10 overflow-hidden bg-gray-50 group">
                    {images.length > 0 ? (
                      <img
                        src={images[currentIndex]}
                        alt={lead.title}
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
                          onClick={(e) => handlePrevImage(lead.id, images.length, e)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                          type="button"
                        >
                          <ChevronLeft className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => handleNextImage(lead.id, images.length, e)}
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
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Title and Location */}
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-1 mb-1">
                        {lead.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-sm truncate">{lead.location}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-sm text-gray-600 pt-1">
                      <span>{lead.purchase_count || 0} sales</span>
                      <span className="text-gray-400">•</span>
                      <span>£{lead.price.toFixed(0)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => navigate(`/dashboard/admin/leads/${lead.id}/edit`)}
                        variant="outline"
                        size="sm"
                        className="flex-1 cursor-pointer h-8 text-sm rounded-lg"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => setDeletingLead(lead)}
                        variant="outline"
                        size="sm"
                        className="cursor-pointer h-8 text-sm text-gray-600 hover:text-red-600 hover:border-red-600 rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
                Showing {startItem}-{endItem} of {totalCount} leads
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
      <AlertDialog open={!!deletingLead} onOpenChange={() => setDeletingLead(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the lead "{deletingLead?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 cursor-pointer rounded-lg"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Lead'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
