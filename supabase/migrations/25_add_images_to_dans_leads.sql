-- ============================================
-- ADD IMAGES TO DAN'S LEADS
-- Migration: 25
-- Description: Add optional image support to dans_leads table
-- ============================================

-- Add image columns to dans_leads table
ALTER TABLE dans_leads
  ADD COLUMN media_urls TEXT[] DEFAULT '{}',
  ADD COLUMN thumbnail_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN dans_leads.media_urls IS 'Array of image URLs for the lead (optional)';
COMMENT ON COLUMN dans_leads.thumbnail_url IS 'Featured image URL (optional)';
