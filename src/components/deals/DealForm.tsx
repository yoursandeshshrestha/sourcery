import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import type { Deal, CreateDealInput, StrategyType, DealStatus } from '@/types/deal';
import { STRATEGY_LABELS } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, Zap, Upload, X, Image as ImageIcon } from 'lucide-react';

interface DealFormProps {
  deal?: Deal;
  mode: 'create' | 'edit';
  onDelete?: () => void;
}

export function DealForm({ deal, mode }: DealFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isCollapsed } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Basic Info
  const [headline, setHeadline] = useState(deal?.headline || '');
  const [description, setDescription] = useState(deal?.description || '');
  const [strategyType, setStrategyType] = useState<StrategyType>(deal?.strategy_type || 'FLIP');
  const [approximateLocation, setApproximateLocation] = useState(deal?.approximate_location || '');
  const [fullAddress, setFullAddress] = useState(deal?.full_address || '');
  const [status, setStatus] = useState<DealStatus>(deal?.status || 'DRAFT');

  // Financial Metrics
  const [purchasePrice, setPurchasePrice] = useState(deal?.financial_metrics.purchase_price?.toString() || '');
  const [refurbCosts, setRefurbCosts] = useState(deal?.financial_metrics.refurb_costs?.toString() || '');
  const [estimatedGdv, setEstimatedGdv] = useState(deal?.financial_metrics.estimated_gdv?.toString() || '');
  const [estimatedRentalIncome, setEstimatedRentalIncome] = useState(
    deal?.financial_metrics.estimated_rental_income?.toString() || ''
  );
  const [estimatedProfit, setEstimatedProfit] = useState(deal?.financial_metrics.estimated_profit?.toString() || '');

  // Fees
  const [reservationFee, setReservationFee] = useState(deal?.reservation_fee?.toString() || '3000');
  const [sourcingFee, setSourcingFee] = useState(deal?.sourcing_fee?.toString() || '');

  // Images
  const [mediaUrls, setMediaUrls] = useState<string[]>(deal?.media_urls || []);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(deal?.thumbnail_url || null);

  // Calculated Values
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [capitalRequired, setCapitalRequired] = useState(0);
  const [calculatedRoi, setCalculatedRoi] = useState<number | null>(null);
  const [calculatedYield, setCalculatedYield] = useState<number | null>(null);
  const [calculatedRoce, setCalculatedRoce] = useState<number | null>(null);

  // Calculate totals and metrics when inputs change
  useEffect(() => {
    const purchase = parseFloat(purchasePrice) || 0;
    const refurb = parseFloat(refurbCosts) || 0;
    const sourcing = parseFloat(sourcingFee) || 0;
    const profit = parseFloat(estimatedProfit) || 0;
    const monthlyRent = parseFloat(estimatedRentalIncome) || 0;

    const total = purchase + refurb + sourcing;
    setTotalInvestment(total);
    setCapitalRequired(total);

    // Calculate ROI (Return on Investment)
    // ROI = (Profit / Total Investment) * 100
    if (total > 0 && profit > 0) {
      setCalculatedRoi((profit / total) * 100);
    } else {
      setCalculatedRoi(null);
    }

    // Calculate Yield (Rental Yield)
    // Yield = (Annual Rental Income / Purchase Price) * 100
    if (purchase > 0 && monthlyRent > 0) {
      const annualRent = monthlyRent * 12;
      setCalculatedYield((annualRent / purchase) * 100);
    } else {
      setCalculatedYield(null);
    }

    // Calculate ROCE (Return on Capital Employed)
    // ROCE = (Annual Net Profit / Capital Employed) * 100
    // Using profit as net profit approximation
    if (total > 0 && monthlyRent > 0) {
      const annualRent = monthlyRent * 12;
      setCalculatedRoce((annualRent / total) * 100);
    } else {
      setCalculatedRoce(null);
    }
  }, [purchasePrice, refurbCosts, sourcingFee, estimatedProfit, estimatedRentalIncome]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        // Upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('deal-images')
          .upload(fileName, file);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('deal-images')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      // Add to media URLs
      const newMediaUrls = [...mediaUrls, ...uploadedUrls];
      setMediaUrls(newMediaUrls);

      // Set first image as thumbnail if not set
      if (!thumbnailUrl && uploadedUrls.length > 0) {
        setThumbnailUrl(uploadedUrls[0]);
      }

      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error uploading images:', error);
      }
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
      // Reset input
      event.target.value = '';
    }
  };

  const removeImage = (urlToRemove: string) => {
    const newMediaUrls = mediaUrls.filter(url => url !== urlToRemove);
    setMediaUrls(newMediaUrls);

    // Update thumbnail if removed
    if (thumbnailUrl === urlToRemove) {
      setThumbnailUrl(newMediaUrls.length > 0 ? newMediaUrls[0] : null);
    }

    toast.success('Image removed');
  };

  const setAsThumbnail = (url: string) => {
    setThumbnailUrl(url);
    toast.success('Thumbnail updated');
  };

  const fillTestData = () => {
    setHeadline('3-Bed Victorian Terrace - Prime BTL Opportunity');
    setDescription(
      'Beautiful Victorian terrace in a highly sought-after area. Perfect for buy-to-let investors looking for strong rental yields.\n\nThe property features three spacious bedrooms, a modern kitchen, and a large rear garden. Recently refurbished to a high standard with new electrics and plumbing throughout.\n\nLocated close to local amenities, schools, and transport links. Strong rental demand in the area with similar properties achieving £1,500 pcm.'
    );
    setStrategyType('BTL');
    setApproximateLocation('Central Manchester, M1');
    setFullAddress('123 Victoria Street, Manchester, M1 4PL');
    setPurchasePrice('250000');
    setRefurbCosts('15000');
    setEstimatedGdv('320000');
    setEstimatedRentalIncome('1500');
    setEstimatedProfit('55000');
    setReservationFee('3000');
    setSourcingFee('7500');
    toast.success('Test data filled!');
  };

  const validateForDraft = () => {
    if (!headline.trim()) {
      toast.error('Please enter a headline');
      return false;
    }
    return true;
  };

  const validateForPublish = () => {
    if (!headline.trim()) {
      toast.error('Please enter a headline');
      return false;
    }
    if (!approximateLocation.trim()) {
      toast.error('Please enter an approximate location');
      return false;
    }
    if (!fullAddress.trim()) {
      toast.error('Please enter the full address');
      return false;
    }
    if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
      toast.error('Please enter a valid purchase price');
      return false;
    }
    if (!sourcingFee || parseFloat(sourcingFee) <= 0) {
      toast.error('Please enter a valid sourcing fee');
      return false;
    }
    return true;
  };

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    // Validate based on save type
    if (saveAsDraft) {
      if (!validateForDraft()) return;
    } else {
      if (!validateForPublish()) return;
    }

    try {
      setLoading(true);

      const dealData: Partial<CreateDealInput> & {
        calculated_roi?: number | null;
        calculated_yield?: number | null;
        calculated_roce?: number | null;
      } = {
        headline: headline.trim(),
        description: description.trim() || null,
        strategy_type: strategyType,
        approximate_location: approximateLocation.trim() || '',
        full_address: fullAddress.trim() || '',
        capital_required: capitalRequired || 0,
        calculated_roi: calculatedRoi,
        calculated_yield: calculatedYield,
        calculated_roce: calculatedRoce,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        thumbnail_url: thumbnailUrl || undefined,
        financial_metrics: {
          purchase_price: purchasePrice ? parseFloat(purchasePrice) : 0,
          refurb_costs: refurbCosts ? parseFloat(refurbCosts) : undefined,
          total_investment: totalInvestment,
          estimated_gdv: estimatedGdv ? parseFloat(estimatedGdv) : undefined,
          estimated_rental_income: estimatedRentalIncome ? parseFloat(estimatedRentalIncome) : undefined,
          estimated_profit: estimatedProfit ? parseFloat(estimatedProfit) : undefined,
        },
        reservation_fee: reservationFee ? parseFloat(reservationFee) : 3000,
        sourcing_fee: sourcingFee ? parseFloat(sourcingFee) : 0,
        status: mode === 'create' ? (saveAsDraft ? 'DRAFT' : 'ACTIVE') : status,
      };

      if (mode === 'create') {
        const { error } = await supabase.from('deals').insert({
          ...dealData,
          sourcer_id: user?.id,
        });

        if (error) throw error;

        toast.success(saveAsDraft ? 'Deal saved as draft' : 'Deal published successfully!');
        navigate('/dashboard/my-deals');
      } else {
        const { error } = await supabase
          .from('deals')
          .update(dealData)
          .eq('id', deal?.id);

        if (error) throw error;

        toast.success('Deal updated successfully');
        navigate('/dashboard/my-deals');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving deal:', error);
      }
      toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} deal`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Help Banner & Test Data Button */}
      {mode === 'create' && (
        <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-muted/50 p-4">
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">💡 Tip: Save your progress</p>
            <p className="text-xs text-muted-foreground">
              Use <strong>"Save as Draft"</strong> to work on your deal privately, or{' '}
              <strong>"Publish Deal"</strong> to make it visible to investors immediately.
            </p>
          </div>
          {import.meta.env.DEV && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillTestData}
              className="cursor-pointer shrink-0"
            >
              <Zap className="h-4 w-4 mr-2" />
              Fill Test Data
            </Button>
          )}
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-md border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="headline">
              Deal Headline <span className="text-destructive">*</span>
            </Label>
            <Input
              id="headline"
              placeholder="e.g., 3-Bed Victorian Terrace - Prime BTL Opportunity"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Catchy title that will attract investors (max 200 characters)
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Detailed description of the property and opportunity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="strategy">
              Strategy Type <span className="text-destructive">*</span>
            </Label>
            <Select value={strategyType} onValueChange={(value) => setStrategyType(value as StrategyType)}>
              <SelectTrigger id="strategy" className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STRATEGY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="cursor-pointer">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === 'edit' && (
            <div>
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select value={status} onValueChange={(value) => setStatus(value as DealStatus)}>
                <SelectTrigger id="status" className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT" className="cursor-pointer">Draft</SelectItem>
                  <SelectItem value="ACTIVE" className="cursor-pointer">Active</SelectItem>
                  <SelectItem value="RESERVED" className="cursor-pointer">Reserved</SelectItem>
                  <SelectItem value="COMPLETED" className="cursor-pointer">Completed</SelectItem>
                  <SelectItem value="CANCELLED" className="cursor-pointer">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Change deal status (Reserved/Completed are set automatically)
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="approximate-location">
              Approximate Location <span className="text-destructive">*</span>
            </Label>
            <Input
              id="approximate-location"
              placeholder="e.g., Central Manchester, M1"
              value={approximateLocation}
              onChange={(e) => setApproximateLocation(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Visible to all users (e.g., area/postcode district)
            </p>
          </div>

          <div>
            <Label htmlFor="full-address">
              Full Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full-address"
              placeholder="e.g., 123 Main Street, Manchester, M1 1AA"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Only visible after reservation
            </p>
          </div>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="rounded-md border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Financial Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchase-price">
                Purchase Price (£) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="purchase-price"
                type="number"
                placeholder="250000"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                min="0"
                step="1000"
              />
              <p className="text-xs text-muted-foreground mt-1">Property purchase price</p>
            </div>

            <div>
              <Label htmlFor="refurb-costs">Refurbishment Costs (£)</Label>
              <Input
                id="refurb-costs"
                type="number"
                placeholder="30000"
                value={refurbCosts}
                onChange={(e) => setRefurbCosts(e.target.value)}
                min="0"
                step="1000"
              />
              <p className="text-xs text-muted-foreground mt-1">Optional renovation costs</p>
            </div>

            <div>
              <Label htmlFor="estimated-gdv">Estimated GDV (£)</Label>
              <Input
                id="estimated-gdv"
                type="number"
                placeholder="350000"
                value={estimatedGdv}
                onChange={(e) => setEstimatedGdv(e.target.value)}
                min="0"
                step="1000"
              />
              <p className="text-xs text-muted-foreground mt-1">Gross Development Value (for flips)</p>
            </div>

            <div>
              <Label htmlFor="estimated-rental">Monthly Rental Income (£)</Label>
              <Input
                id="estimated-rental"
                type="number"
                placeholder="1500"
                value={estimatedRentalIncome}
                onChange={(e) => setEstimatedRentalIncome(e.target.value)}
                min="0"
                step="50"
              />
              <p className="text-xs text-muted-foreground mt-1">Expected monthly rent (for BTL/HMO)</p>
            </div>

            <div>
              <Label htmlFor="estimated-profit">Estimated Profit (£)</Label>
              <Input
                id="estimated-profit"
                type="number"
                placeholder="50000"
                value={estimatedProfit}
                onChange={(e) => setEstimatedProfit(e.target.value)}
                min="0"
                step="1000"
              />
              <p className="text-xs text-muted-foreground mt-1">Total expected profit on exit</p>
            </div>
          </div>

          {/* Calculated Values */}
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Investment</p>
                <p className="text-xl font-bold">
                  £{totalInvestment.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Purchase + Refurb + Sourcing Fee
                </p>
              </div>

              <div className="rounded-md bg-muted p-4">
                <p className="text-sm text-muted-foreground mb-1">Capital Required</p>
                <p className="text-xl font-bold">
                  £{capitalRequired.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Amount investor needs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fees */}
      <div className="rounded-md border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Fees & Charges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reservation-fee">
              Reservation Fee (£) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reservation-fee"
              type="number"
              placeholder="3000"
              value={reservationFee}
              onChange={(e) => setReservationFee(e.target.value)}
              min="0"
              step="100"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upfront fee to reserve this deal (typically £3,000)
            </p>
          </div>

          <div>
            <Label htmlFor="sourcing-fee">
              Your Sourcing Fee (£) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sourcing-fee"
              type="number"
              placeholder="7500"
              value={sourcingFee}
              onChange={(e) => setSourcingFee(e.target.value)}
              min="0"
              step="100"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your commission for sourcing this opportunity
            </p>
          </div>
        </div>
      </div>

      {/* Property Images */}
      <div className="rounded-md border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Property Images</h2>

        {/* Upload Button */}
        <div className="mb-4">
          <Label htmlFor="image-upload" className="cursor-pointer">
            <div className="flex items-center justify-center border-2 border-dashed border-border rounded-md p-8 hover:border-primary/50 transition-colors">
              {uploadingImages ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Uploading images...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm font-medium">Click to upload images</span>
                  <span className="text-xs">PNG, JPG up to 5MB each</span>
                </div>
              )}
            </div>
          </Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploadingImages}
            className="hidden"
          />
        </div>

        {/* Image Gallery */}
        {mediaUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaUrls.map((url, index) => (
              <div key={index} className="relative group rounded-md overflow-hidden border border-border">
                <img
                  src={url}
                  alt={`Property ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                {/* Thumbnail Badge */}
                {thumbnailUrl === url && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Thumbnail
                  </div>
                )}
                {/* Action Buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {thumbnailUrl !== url && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setAsThumbnail(url)}
                      className="cursor-pointer"
                    >
                      <ImageIcon className="h-4 w-4 mr-1" />
                      Set as Thumbnail
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(url)}
                    className="cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {mediaUrls.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No images uploaded yet. Add property images to attract more investors.
          </div>
        )}
      </div>

      </form>

      {/* Fixed Footer Actions */}
      <div
        className="fixed bottom-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border z-10 transition-all duration-300"
        style={{ left: isCollapsed ? '64px' : '256px' }}
      >
        <div className="flex gap-3 justify-end px-6 py-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate('/dashboard/my-deals')}
            disabled={loading}
            className="cursor-pointer"
          >
            Cancel
          </Button>

          {mode === 'create' ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={loading}
                className="cursor-pointer"
                onClick={() => handleSubmit(true)}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save as Draft
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="lg"
                disabled={loading}
                className="cursor-pointer"
                onClick={() => handleSubmit(false)}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Publish Deal
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="lg"
              disabled={loading}
              className="cursor-pointer"
              onClick={() => handleSubmit(false)}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Update Deal
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
