import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { DansLead, LeadPurchase } from '@/types/lead';
import { createDansLeadCheckoutSession } from '@/lib/stripe';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Home, ShoppingCart, Loader2, Lock, CheckCircle2 } from 'lucide-react';

export default function BrowseLeadsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<DansLead[]>([]);
  const [purchases, setPurchases] = useState<LeadPurchase[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<DansLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasingLeadId, setPurchasingLeadId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeadsAndPurchases();
  }, [user]);

  useEffect(() => {
    filterLeads();
  }, [leads, searchQuery]);

  const fetchLeadsAndPurchases = async () => {
    try {
      setLoading(true);

      // Fetch all leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('dans_leads')
        .select('*')
        .eq('is_sold', false)
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;

      // Fetch user's purchases if logged in
      let purchasesData: LeadPurchase[] = [];
      if (user) {
        const { data, error } = await supabase
          .from('lead_purchases')
          .select('*')
          .eq('buyer_id', user.id);

        if (error) throw error;
        purchasesData = data || [];
      }

      setLeads(leadsData || []);
      setPurchases(purchasesData);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching leads:', error);
      }
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.title.toLowerCase().includes(query) ||
          lead.location.toLowerCase().includes(query) ||
          lead.description.toLowerCase().includes(query) ||
          lead.property_type?.toLowerCase().includes(query)
      );
    }

    setFilteredLeads(filtered);
  };

  const isPurchased = (leadId: string) => {
    return purchases.some((p) => p.lead_id === leadId);
  };

  const handleBuyLead = async (lead: DansLead) => {
    if (!user) {
      toast.error('Please login to purchase leads');
      navigate('/?auth=login');
      return;
    }

    // Check if already purchased
    if (isPurchased(lead.id)) {
      toast.error('You have already purchased this lead');
      navigate('/dashboard/leads/purchased');
      return;
    }

    try {
      setPurchasingLeadId(lead.id);

      // Create checkout session
      const { url } = await createDansLeadCheckoutSession(lead.id, lead.price);

      if (!url) {
        throw new Error('Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error purchasing lead:', error);
      }
      toast.error('Failed to start purchase. Please try again.');
      setPurchasingLeadId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Dan's Leads</h1>
                <p className="text-muted-foreground mt-1">
                  Exclusive motivated seller contacts
                </p>
              </div>
              <Button
                onClick={() => navigate('/dashboard/leads/purchased')}
                variant="outline"
                className="cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                My Purchases
                {purchases.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {purchases.length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by location, property type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 cursor-text"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-16">
            <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No leads found' : 'No leads available'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Check back later for new motivated seller contacts'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Showing {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLeads.map((lead) => {
                const purchased = isPurchased(lead.id);
                const purchasing = purchasingLeadId === lead.id;

                return (
                  <Card
                    key={lead.id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-200"
                  >
                    {/* Thumbnail Image */}
                    {lead.thumbnail_url && (
                      <div className="w-full h-48 overflow-hidden bg-muted">
                        <img
                          src={lead.thumbnail_url}
                          alt={lead.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-6 space-y-4">
                      {/* Title */}
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{lead.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{lead.location}</span>
                        </div>
                      </div>

                      {/* Property Type */}
                      {lead.property_type && (
                        <Badge variant="secondary">{lead.property_type}</Badge>
                      )}

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {lead.description}
                      </p>

                      {/* Price and Action */}
                      <div className="pt-4 border-t border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">
                            £{lead.price.toFixed(2)}
                          </span>
                          <span className="text-xs text-muted-foreground">per lead</span>
                        </div>

                        {purchased ? (
                          <Button
                            onClick={() => navigate('/dashboard/leads/purchased')}
                            variant="outline"
                            className="w-full cursor-pointer"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            View Details
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleBuyLead(lead)}
                            disabled={purchasing}
                            className="w-full cursor-pointer"
                          >
                            {purchasing ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Buy Lead
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
