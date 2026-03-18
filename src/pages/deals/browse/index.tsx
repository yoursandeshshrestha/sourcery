import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Deal, StrategyType } from '@/types/deal';
import { STRATEGY_LABELS } from '@/types/deal';
import { DealCard } from '@/components/deals/DealCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Building2, X, Home, ChevronDown } from 'lucide-react';

export default function BrowseDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [strategyFilter, setStrategyFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    filterAndSortDeals();
  }, [deals, searchQuery, strategyFilter, sortBy]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDeals = async () => {
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
            company_name
          )
        `
        )
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDeals(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching deals:', error);
      }
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDeals = () => {
    let filtered = [...deals];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (deal) =>
          deal.headline.toLowerCase().includes(query) ||
          deal.approximate_location.toLowerCase().includes(query) ||
          deal.description?.toLowerCase().includes(query)
      );
    }

    // Apply strategy filter
    if (strategyFilter.length > 0) {
      filtered = filtered.filter((deal) => strategyFilter.includes(deal.strategy_type));
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'roi_high':
        filtered.sort((a, b) => (b.calculated_roi || 0) - (a.calculated_roi || 0));
        break;
      case 'roi_low':
        filtered.sort((a, b) => (a.calculated_roi || 0) - (b.calculated_roi || 0));
        break;
      case 'capital_low':
        filtered.sort((a, b) => a.capital_required - b.capital_required);
        break;
      case 'capital_high':
        filtered.sort((a, b) => b.capital_required - a.capital_required);
        break;
    }

    setFilteredDeals(filtered);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[#F5F5F5]">
        {/* Top Search Bar Skeleton */}
        <div className="bg-white border-b border-[#E9E6DF] px-6 py-4">
          <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="flex-1 max-w-2xl h-10 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>

        {/* Title Skeleton */}
        <div className="bg-white border-b border-[#E9E6DF] px-6 py-4">
          <div className="max-w-[1920px] mx-auto">
            <Skeleton className="h-7 w-64 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1920px] mx-auto px-6 py-6">
            {/* Result Count and Sort Skeleton */}
            <div className="flex items-center justify-between mb-5">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-10 w-48 rounded-lg" />
            </div>

            {/* Deals Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E9E6DF] overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5]">
      {/* Top Search Bar */}
      <div className="bg-white border-b border-[#E9E6DF] px-6 py-4">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-4">
          {/* Logo/Home */}
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-[#1287ff] hover:text-[#0A6FE6] transition-colors cursor-pointer shrink-0"
          >
            <Home className="h-5 w-5" />
            <span className="font-semibold text-base">Sourcery</span>
          </Link>

          {/* Search Input */}
          <div className="flex-1 max-w-2xl mx-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B] z-10" />
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-2.5 text-sm border border-[#E9E6DF] rounded-full focus:outline-none focus:border-[#1287ff] transition-colors bg-white"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 px-6 py-1.5 bg-[#1287ff] hover:bg-[#0A6FE6] text-white text-sm font-medium rounded-full cursor-pointer transition-colors">
              Search
            </button>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#E9E6DF] bg-white rounded-full hover:border-[#1287ff] transition-colors cursor-pointer shrink-0"
          >
            <span className="text-sm font-medium text-[#5C5C49]">Filter</span>
          </button>
        </div>
      </div>

      {/* Title and Filter Pills */}
      <div className="bg-white border-b border-[#E9E6DF] px-6 py-4">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1A1A1A] mb-1">
              Investment Opportunities
            </h1>
            <p className="text-sm text-[#6B6B6B]">
              {searchQuery ? `in ${searchQuery}` : 'all around the world'}
            </p>
          </div>

          {(strategyFilter.length > 0 || sortBy !== 'newest') && (
            <div className="flex items-center gap-2 flex-wrap">
              {strategyFilter.map((strategy) => (
                <span key={strategy} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E9E6DF] rounded-full text-sm">
                  {STRATEGY_LABELS[strategy as StrategyType]}
                  <button
                    onClick={() => setStrategyFilter(strategyFilter.filter(s => s !== strategy))}
                    className="hover:bg-[#F5F5F5] rounded-full p-0.5 cursor-pointer text-lg leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
              {sortBy !== 'newest' && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E9E6DF] rounded-full text-sm">
                  {sortBy === 'oldest' && 'Oldest First'}
                  {sortBy === 'capital_low' && 'Capital: Low to High'}
                  {sortBy === 'capital_high' && 'Capital: High to Low'}
                  {sortBy === 'roi_high' && 'ROI: High to Low'}
                  {sortBy === 'roi_low' && 'ROI: Low to High'}
                  <button
                    onClick={() => setSortBy('newest')}
                    className="hover:bg-[#F5F5F5] rounded-full p-0.5 cursor-pointer text-lg leading-none"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1920px] mx-auto px-6 py-6">
          {/* Result Count and Sort */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-[#6B6B6B]">
              Result <span className="font-semibold text-[#1A1A1A]">{filteredDeals.length}</span> {filteredDeals.length === 1 ? 'home' : 'homes'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6B6B6B]">Sort by :</span>
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-[#E9E6DF] rounded-lg hover:border-[#1287ff] transition-colors cursor-pointer bg-white text-[#1A1A1A] min-w-[180px] justify-between"
                >
                  <span>
                    {sortBy === 'newest' && 'Newest First'}
                    {sortBy === 'oldest' && 'Oldest First'}
                    {sortBy === 'capital_low' && 'Capital: Low to High'}
                    {sortBy === 'capital_high' && 'Capital: High to Low'}
                    {sortBy === 'roi_high' && 'ROI: High to Low'}
                    {sortBy === 'roi_low' && 'ROI: Low to High'}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isSortDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-full bg-white border border-[#E9E6DF] rounded-lg shadow-lg z-10 overflow-hidden">
                    {[
                      { value: 'newest', label: 'Newest First' },
                      { value: 'oldest', label: 'Oldest First' },
                      { value: 'capital_low', label: 'Capital: Low to High' },
                      { value: 'capital_high', label: 'Capital: High to Low' },
                      { value: 'roi_high', label: 'ROI: High to Low' },
                      { value: 'roi_low', label: 'ROI: Low to High' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                          sortBy === option.value
                            ? 'bg-[#1287ff]/10 text-[#1287ff] font-medium'
                            : 'text-[#1A1A1A] hover:bg-[#F9F7F4]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Deals Grid */}
          {filteredDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-[#E9E6DF] rounded-2xl bg-white">
              <Building2 className="h-16 w-16 text-[#C5C0B8] mb-4" />
              <p className="text-xl font-semibold mb-2 text-[#1A1A1A]">No deals found</p>
              <p className="text-[#6B6B6B]">
                {searchQuery || strategyFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Check back soon for new opportunities'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Filter Sidebar */}
      {isFilterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsFilterOpen(false)}
          ></div>

          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
            {/* Header - Fixed */}
            <div className="p-6 pb-4 border-b border-[#E9E6DF] shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#1A1A1A]">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filter Sections - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Strategy Type */}
                <div className="pb-6 border-b border-[#E9E6DF]">
                  <label className="block text-base font-semibold mb-4 text-[#1A1A1A]">Strategy Type</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STRATEGY_LABELS).map(([value, label]) => {
                      const isSelected = strategyFilter.includes(value);
                      return (
                        <button
                          key={value}
                          onClick={() => {
                            if (isSelected) {
                              setStrategyFilter(strategyFilter.filter(s => s !== value));
                            } else {
                              setStrategyFilter([...strategyFilter, value]);
                            }
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#1287ff] text-white'
                              : 'bg-white border border-[#E9E6DF] text-[#1A1A1A] hover:border-[#1287ff]'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort By */}
                <div className="pb-6 border-b border-[#E9E6DF]">
                  <label className="block text-base font-semibold mb-4 text-[#1A1A1A]">Sort By</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'newest', label: 'Newest' },
                      { value: 'oldest', label: 'Oldest' },
                      { value: 'capital_low', label: 'Capital ↑' },
                      { value: 'capital_high', label: 'Capital ↓' },
                      { value: 'roi_high', label: 'ROI ↓' },
                      { value: 'roi_low', label: 'ROI ↑' },
                    ].map((option) => {
                      const isSelected = sortBy === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setSortBy(option.value)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#1287ff] text-white'
                              : 'bg-white border border-[#E9E6DF] text-[#1A1A1A] hover:border-[#1287ff]'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons - Fixed */}
            <div className="p-6 pt-4 border-t border-[#E9E6DF] shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStrategyFilter([]);
                    setSortBy('newest');
                  }}
                  className="flex-1 px-4 py-3 border border-[#E9E6DF] rounded-lg text-[15px] font-medium hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 px-4 py-3 bg-[#1287ff] hover:bg-[#0A6FE6] text-white rounded-lg text-[15px] font-medium transition-colors cursor-pointer"
                >
                  Show results
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
