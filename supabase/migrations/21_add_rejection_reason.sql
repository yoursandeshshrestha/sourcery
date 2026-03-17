-- ============================================
-- ADD REJECTION REASON FIELD
-- Migration: 21
-- Description: Add rejection_reason field to profiles table for tracking why applications are rejected
-- ============================================

ALTER TABLE profiles ADD COLUMN rejection_reason TEXT;

-- Add comment
COMMENT ON COLUMN profiles.rejection_reason IS 'Reason provided by admin when rejecting sourcer application';
