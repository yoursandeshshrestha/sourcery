import { useState, useRef } from 'react';
import { Pencil, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import type { BasicInfoFormData } from '../types';
import {
  validateFileType,
  validateFileSize,
  formatFileSize,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from '@/lib/storage';

export function BasicInfoSection() {
  const { profile, user } = useAuth();
  const { updateBasicInfo, uploadAvatar, deleteAvatar, loading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<BasicInfoFormData>({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || '',
    });
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setSaveError('First name and last name are required');
      return;
    }

    const result = await updateBasicInfo(formData);
    if (result.success) {
      setIsEditing(false);
      setSaveError(null);
    } else {
      setSaveError(result.error || 'Failed to update profile');
    }
  };

  const handleFileSelect = async (file: File) => {
    setAvatarError(null);

    // Validate file type
    if (!validateFileType(file, ALLOWED_FILE_TYPES.avatars)) {
      setAvatarError('Invalid file type. Please upload JPG, PNG, or WebP');
      return;
    }

    // Validate file size
    if (!validateFileSize(file, MAX_FILE_SIZE.avatars)) {
      setAvatarError(`File too large. Max size: ${formatFileSize(MAX_FILE_SIZE.avatars)}`);
      return;
    }

    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(file);
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const currentAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const initials = profile ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase() : 'U';

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[15px] font-[450] leading-[23px] text-foreground">
            Basic Information
          </h3>
          <p className="text-xs text-muted-foreground">
            Your personal details and contact information
          </p>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            disabled={loading}
            className="cursor-pointer rounded-lg"
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
        )}
      </div>

      {/* Avatar Upload - Compact */}
      <div className="rounded-[7px] bg-card border border-border p-6">
        <div className="flex items-center gap-6">
          {/* Avatar Preview */}
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage src={currentAvatar || undefined} alt="Profile picture" />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Upload Section */}
          <div className="flex-1">
            <div className="space-y-1 mb-3">
              <h4 className="text-sm font-medium text-foreground">Profile Picture</h4>
              <p className="text-xs text-muted-foreground">
                {profile?.avatar_url
                  ? 'Custom avatar uploaded'
                  : 'Using Google avatar. Upload a custom picture (JPG, PNG, WebP, max 5MB)'}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_FILE_TYPES.avatars.join(',')}
              onChange={handleFileInputChange}
              disabled={loading || isUploadingAvatar}
              className="hidden"
            />

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || isUploadingAvatar}
                className="cursor-pointer rounded-lg"
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New
                  </>
                )}
              </Button>

              {profile?.avatar_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    setAvatarError(null);
                    const result = await deleteAvatar();
                    if (!result.success) {
                      setAvatarError(result.error || 'Failed to remove avatar');
                    }
                  }}
                  disabled={loading || isUploadingAvatar}
                  className="cursor-pointer text-destructive hover:text-destructive rounded-lg"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>

            {avatarError && (
              <p className="text-xs text-destructive mt-2">{avatarError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="rounded-[7px] bg-card border border-border">
        {isEditing ? (
          // Edit Mode
          <div className="p-6 space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="cursor-default">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  placeholder="Enter first name"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="cursor-default">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  placeholder="Enter last name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="cursor-default">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+44 7700 900000"
                disabled={loading}
              />
            </div>


            {/* Error Message */}
            {saveError && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                {saveError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="cursor-pointer rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="cursor-pointer rounded-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        ) : (
          // View Mode
          <ul className="min-w-0 min-h-0">
            {/* Name */}
            <li className="relative flex items-center justify-between gap-3 min-h-[60px] px-4 py-3 first:rounded-t-[6px] last:rounded-b-[6px]">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <label className="text-[13px] font-medium leading-normal text-foreground cursor-default">
                  Name
                </label>
                <span className="text-[12px] font-[450] leading-normal text-muted-foreground break-words">
                  Your full name
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[13px] text-foreground">
                  {profile.first_name} {profile.last_name}
                </span>
              </div>
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-4 right-4 h-px bg-border/50"
              />
            </li>

            {/* Phone */}
            <li className="relative flex items-center justify-between gap-3 min-h-[60px] px-4 py-3 first:rounded-t-[6px] last:rounded-b-[6px]">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <label className="text-[13px] font-medium leading-normal text-foreground cursor-default">
                  Phone
                </label>
                <span className="text-[12px] font-[450] leading-normal text-muted-foreground break-words">
                  Contact phone number
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[13px] text-muted-foreground">
                  {profile.phone || 'Not provided'}
                </span>
              </div>
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-4 right-4 h-px bg-border/50"
              />
            </li>

          </ul>
        )}
      </section>
    </div>
  );
}
