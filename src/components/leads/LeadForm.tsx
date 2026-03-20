import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import type { DansLead, CreateLeadInput } from '@/types/lead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Zap, Home, MapPin, DollarSign, User, Phone, Mail, Lock, Upload, X, Image as ImageIcon } from 'lucide-react';

interface LeadFormProps {
  lead?: DansLead;
  mode: 'create' | 'edit';
}

export function LeadForm({ lead, mode }: LeadFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isCollapsed } = useSidebar();
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Public Information
  const [title, setTitle] = useState(lead?.title || '');
  const [description, setDescription] = useState(lead?.description || '');
  const [location, setLocation] = useState(lead?.location || '');
  const [propertyType, setPropertyType] = useState(lead?.property_type || '');
  const [price, setPrice] = useState(lead?.price.toString() || '40.00');

  // Images (Optional)
  const [mediaUrls, setMediaUrls] = useState<string[]>(lead?.media_urls || []);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(lead?.thumbnail_url || null);

  // Private Information (Locked)
  const [sellerName, setSellerName] = useState(lead?.full_details.seller_name || '');
  const [sellerPhone, setSellerPhone] = useState(lead?.full_details.seller_phone || '');
  const [sellerEmail, setSellerEmail] = useState(lead?.full_details.seller_email || '');
  const [fullAddress, setFullAddress] = useState(lead?.full_details.full_address || '');
  const [additionalNotes, setAdditionalNotes] = useState(lead?.full_details.additional_notes || '');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check max 3 images limit
    const remainingSlots = 3 - mediaUrls.length;
    if (remainingSlots <= 0) {
      toast.error('Maximum 3 images allowed');
      event.target.value = '';
      return;
    }

    try {
      setUploadingImages(true);
      const uploadedUrls: string[] = [];
      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      if (files.length > remainingSlots) {
        toast.error(`Only ${remainingSlots} more image(s) can be added (max 3 total)`);
      }

      for (const file of filesToUpload) {
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
        const fileName = `leads/${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

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

      if (uploadedUrls.length > 0) {
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      }
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
    setTitle('3 Bed Semi in Leeds - Motivated Seller');
    setDescription('Owner needs quick sale due to relocation. Property in good condition with modern kitchen and bathroom. Great opportunity for investors.');
    setLocation('Leeds, LS6');
    setPropertyType('Semi-Detached');
    setPrice('40.00');
    setSellerName('John Smith');
    setSellerPhone('+44 7700 900123');
    setSellerEmail('john.smith@example.com');
    setFullAddress('123 Victoria Road, Leeds, LS6 2AB');
    setAdditionalNotes('Seller is flexible on completion dates. Property has been on the market for 2 weeks.');
    toast.success('Test data filled!');
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return false;
    }
    if (!description.trim()) {
      toast.error('Please enter a description');
      return false;
    }
    if (!location.trim()) {
      toast.error('Please enter a location');
      return false;
    }
    if (!sellerName.trim()) {
      toast.error('Please enter seller name');
      return false;
    }
    if (!sellerPhone.trim()) {
      toast.error('Please enter seller phone');
      return false;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const leadData: CreateLeadInput = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        property_type: propertyType.trim() || null,
        price: parseFloat(price),
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        thumbnail_url: thumbnailUrl || undefined,
        full_details: {
          seller_name: sellerName.trim(),
          seller_phone: sellerPhone.trim(),
          seller_email: sellerEmail.trim() || undefined,
          full_address: fullAddress.trim() || undefined,
          additional_notes: additionalNotes.trim() || undefined,
        },
      };

      if (mode === 'edit' && lead) {
        // Update existing lead
        const { error } = await supabase
          .from('dans_leads')
          .update(leadData)
          .eq('id', lead.id);

        if (error) throw error;
        toast.success('Lead updated successfully');
        navigate('/dashboard/admin/leads');
      } else {
        // Create new lead
        const { error } = await supabase
          .from('dans_leads')
          .insert({
            ...leadData,
            admin_id: user?.id,
          });

        if (error) throw error;
        toast.success('Lead created successfully');
        navigate('/dashboard/admin/leads');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving lead:', error);
      }
      toast.error('Failed to save lead');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
      {/* Help Banner & Test Data Button */}
      {mode === 'create' && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">💡 Creating a new lead</p>
            <p className="text-xs text-muted-foreground">
              Fill in the public information that buyers will see, and the private seller contact details that will be unlocked after purchase.
            </p>
          </div>
          {import.meta.env.DEV && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillTestData}
              className="cursor-pointer shrink-0 rounded-lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Fill Test Data
            </Button>
          )}
        </div>
      )}

      {/* Public Information Section */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Home className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1">Public Information</h2>
            <p className="text-sm text-muted-foreground">
              This information will be visible to all users browsing the marketplace
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 3 Bed Semi in Leeds - Motivated Seller"
              className="cursor-text"
            />
            <p className="text-xs text-muted-foreground">
              Keep it concise and attention-grabbing
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the opportunity (visible to all users)"
              rows={4}
              className="cursor-text resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Provide enough detail to attract buyers without revealing sensitive information
            </p>
          </div>

          {/* Location and Property Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Leeds, LS6"
                className="cursor-text"
              />
              <p className="text-xs text-muted-foreground">
                General area (not full address)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyType">
                Property Type
              </Label>
              <Input
                id="propertyType"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                placeholder="e.g., Semi-Detached, Terrace"
                className="cursor-text"
              />
              <p className="text-xs text-muted-foreground">
                Optional but recommended
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">
              Price per Lead (£) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                £
              </span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="40.00"
                className="pl-7 cursor-text"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Typical range: £30-£50 per lead
            </p>
          </div>
        </div>
      </div>

      {/* Property Images (Optional) */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Property Images (Optional)</h2>

        {/* Upload Button */}
        <div className="mb-4">
          <Label htmlFor="image-upload" className={mediaUrls.length >= 3 ? 'cursor-not-allowed' : 'cursor-pointer'}>
            <div className={`flex items-center justify-center border-2 border-dashed border-border rounded-lg p-8 transition-colors ${
              mediaUrls.length >= 3 ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 cursor-pointer'
            }`}>
              {uploadingImages ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Uploading images...</span>
                </div>
              ) : mediaUrls.length >= 3 ? (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm font-medium">Maximum images reached</span>
                  <span className="text-xs">Remove an image to upload more (max 3 images)</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm font-medium">Click to upload images</span>
                  <span className="text-xs">PNG, JPG up to 5MB each (max 3 images)</span>
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
            disabled={uploadingImages || mediaUrls.length >= 3}
            className="hidden"
          />
        </div>

        {/* Image Gallery */}
        {mediaUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaUrls.map((url, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden border border-border aspect-video">
                <img
                  src={url}
                  alt={`Property ${index + 1}`}
                  className="w-full h-full object-cover"
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
                      className="cursor-pointer rounded-lg"
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
                    className="cursor-pointer rounded-lg"
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
            No images uploaded. Add property images to make the lead more appealing (optional).
          </div>
        )}
      </div>

      {/* Private Information Section */}
      <div className="rounded-lg border-2 border-amber-200 bg-amber-50/30 dark:border-amber-900 dark:bg-amber-950/20 p-6">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <Lock className="h-5 w-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1">Private Information (Locked)</h2>
            <p className="text-sm text-muted-foreground">
              This information will only be revealed to users after they purchase the lead
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Seller Name and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sellerName">
                Seller Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sellerName"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="John Smith"
                className="cursor-text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellerPhone">
                Seller Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sellerPhone"
                value={sellerPhone}
                onChange={(e) => setSellerPhone(e.target.value)}
                placeholder="+44 7700 900123"
                className="cursor-text"
              />
            </div>
          </div>

          {/* Seller Email */}
          <div className="space-y-2">
            <Label htmlFor="sellerEmail">
              Seller Email
            </Label>
            <Input
              id="sellerEmail"
              type="email"
              value={sellerEmail}
              onChange={(e) => setSellerEmail(e.target.value)}
              placeholder="john.smith@example.com"
              className="cursor-text"
            />
            <p className="text-xs text-muted-foreground">
              Optional but recommended
            </p>
          </div>

          {/* Full Address */}
          <div className="space-y-2">
            <Label htmlFor="fullAddress">
              Full Property Address
            </Label>
            <Input
              id="fullAddress"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="123 Victoria Road, Leeds, LS6 2AB"
              className="cursor-text"
            />
            <p className="text-xs text-muted-foreground">
              Complete address including postcode (optional)
            </p>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any additional information for the buyer (e.g., best time to call, seller motivation, property condition)"
              rows={4}
              className="cursor-text resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Help buyers understand the opportunity better
            </p>
          </div>
        </div>
      </div>

      </form>

      {/* Fixed Footer Actions */}
      <div
        className="fixed bottom-0 right-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t border-border z-10 transition-all duration-300"
        style={{ left: isCollapsed ? '64px' : '256px' }}
      >
        <div className="flex gap-3 justify-end px-6 py-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate('/dashboard/admin/leads')}
            disabled={saving}
            className="cursor-pointer rounded-lg"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="lg"
            disabled={saving}
            className="cursor-pointer rounded-lg"
            onClick={handleSave}
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {mode === 'create' ? 'Create Lead' : 'Update Lead'}
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
