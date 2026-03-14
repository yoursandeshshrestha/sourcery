import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { BasicInfoFormData } from '../types';
import { uploadFile, deleteFile, extractPathFromUrl } from '@/lib/storage';

export function useProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update basic profile information
   */
  const updateBasicInfo = async (data: BasicInfoFormData) => {
    if (!user) throw new Error('Not authenticated');

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name.trim(),
          last_name: data.last_name.trim(),
          phone: data.phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Upload avatar
   */
  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error('Not authenticated');

    setLoading(true);
    setError(null);

    try {
      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = extractPathFromUrl(profile.avatar_url);
        if (oldPath) {
          await deleteFile('avatars', oldPath);
        }
      }

      // Upload new avatar
      const { url, error: uploadError } = await uploadFile({
        bucket: 'avatars',
        file,
        userId: user.id,
      });

      if (uploadError) throw uploadError;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload avatar';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };


  /**
   * Delete avatar (revert to Google avatar)
   */
  const deleteAvatar = async () => {
    if (!user) throw new Error('Not authenticated');

    setLoading(true);
    setError(null);

    try {
      // Delete avatar from storage if exists
      if (profile?.avatar_url) {
        const path = extractPathFromUrl(profile.avatar_url);
        if (path) {
          await deleteFile('avatars', path);
        }
      }

      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete avatar';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Upload KYC document
   */
  const uploadKYCDocument = async (
    file: File,
    documentType: 'id' | 'aml' | 'insurance'
  ) => {
    if (!user) throw new Error('Not authenticated');
    if (profile?.role !== 'SOURCER') {
      throw new Error('Only sourcers can upload KYC documents');
    }

    setLoading(true);
    setError(null);

    try {
      // Determine database field
      const dbFieldMap = {
        id: 'id_document_url',
        aml: 'aml_document_url',
        insurance: 'insurance_document_url',
      } as const;
      const dbField = dbFieldMap[documentType] as 'id_document_url' | 'aml_document_url' | 'insurance_document_url';

      // Delete old document if exists
      const oldUrl = profile[dbField] as string | null;
      if (oldUrl) {
        const oldPath = extractPathFromUrl(oldUrl);
        if (oldPath) {
          await deleteFile('verification-documents', oldPath);
        }
      }

      // Upload new document
      const { url, error: uploadError } = await uploadFile({
        bucket: 'verification-documents',
        file,
        userId: user.id,
        path: 'kyc', // Store in kyc subfolder
      });

      if (uploadError) throw uploadError;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          [dbField]: url,
          verification_status: 'PENDING', // Reset to pending when documents change
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload document';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete KYC document
   */
  const deleteKYCDocument = async (documentType: 'id' | 'aml' | 'insurance') => {
    if (!user) throw new Error('Not authenticated');
    if (profile?.role !== 'SOURCER') {
      throw new Error('Only sourcers can delete KYC documents');
    }

    setLoading(true);
    setError(null);

    try {
      const dbFieldMap = {
        id: 'id_document_url',
        aml: 'aml_document_url',
        insurance: 'insurance_document_url',
      } as const;
      const dbField = dbFieldMap[documentType] as 'id_document_url' | 'aml_document_url' | 'insurance_document_url';
      const documentUrl = profile[dbField] as string | null;

      if (!documentUrl) return { success: true };

      // Delete from storage
      const path = extractPathFromUrl(documentUrl);
      if (path) {
        await deleteFile('verification-documents', path);
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          [dbField]: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete document';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateBasicInfo,
    uploadAvatar,
    deleteAvatar,
    uploadKYCDocument,
    deleteKYCDocument,
  };
}
