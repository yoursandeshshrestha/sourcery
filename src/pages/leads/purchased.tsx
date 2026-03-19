import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { LeadPurchase, DansLead } from '@/types/lead';
import { formatDateTime } from '@/lib/date';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  CheckCircle2
} from 'lucide-react';

interface PurchaseWithLead extends LeadPurchase {
  lead: DansLead;
}

export default function PurchasedLeadsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<PurchaseWithLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, [user]);

  const fetchPurchases = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('lead_purchases')
        .select(`
          *,
          lead:dans_leads(*)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

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

  return (
    <div className="px-6 pt-6 pb-32 w-full">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => navigate('/dashboard/leads')}
          variant="ghost"
          className="mb-4 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Purchased Leads</h1>
            <p className="text-muted-foreground">
              View all seller contacts you've purchased
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {purchases.length} {purchases.length === 1 ? 'Lead' : 'Leads'}
          </Badge>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-24 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No purchased leads yet</h3>
          <p className="text-muted-foreground mb-6">
            Browse the marketplace to find motivated seller contacts
          </p>
          <Button
            onClick={() => navigate('/dashboard/leads')}
            className="cursor-pointer"
          >
            Browse Leads
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {purchases.map((purchase) => {
            const lead = purchase.lead;
            const details = lead.full_details;

            return (
              <Card key={purchase.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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

                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{lead.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{lead.location}</span>
                      </div>
                      {lead.property_type && (
                        <Badge variant="secondary" className="mt-2">
                          {lead.property_type}
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Purchased
                    </Badge>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-sm text-muted-foreground">{lead.description}</p>
                  </div>

                  {/* Seller Contact Details (Unlocked) */}
                  <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-3">
                      <FileText className="h-4 w-4" />
                      <span>Seller Contact Details</span>
                    </div>

                    {/* Seller Name */}
                    {details.seller_name && (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">Name</p>
                            <p className="text-sm font-medium truncate">{details.seller_name}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(details.seller_name, `name-${purchase.id}`)}
                          className="cursor-pointer shrink-0"
                        >
                          {copiedField === `name-${purchase.id}` ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Phone */}
                    {details.seller_phone && (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <a
                              href={`tel:${details.seller_phone}`}
                              className="text-sm font-medium text-primary hover:underline truncate block cursor-pointer"
                            >
                              {details.seller_phone}
                            </a>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(details.seller_phone, `phone-${purchase.id}`)}
                          className="cursor-pointer shrink-0"
                        >
                          {copiedField === `phone-${purchase.id}` ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Email */}
                    {details.seller_email && (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">Email</p>
                            <a
                              href={`mailto:${details.seller_email}`}
                              className="text-sm font-medium text-primary hover:underline truncate block cursor-pointer"
                            >
                              {details.seller_email}
                            </a>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(details.seller_email, `email-${purchase.id}`)}
                          className="cursor-pointer shrink-0"
                        >
                          {copiedField === `email-${purchase.id}` ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Full Address */}
                    {details.full_address && (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Home className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">Address</p>
                            <p className="text-sm font-medium">{details.full_address}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(details.full_address!, `address-${purchase.id}`)}
                          className="cursor-pointer shrink-0"
                        >
                          {copiedField === `address-${purchase.id}` ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Additional Notes */}
                    {details.additional_notes && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-1">Additional Notes</p>
                        <p className="text-sm">{details.additional_notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Purchase Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-border text-sm text-muted-foreground">
                    <span>Purchased {formatDateTime(new Date(purchase.created_at))}</span>
                    <span className="font-semibold text-foreground">£{purchase.amount.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
