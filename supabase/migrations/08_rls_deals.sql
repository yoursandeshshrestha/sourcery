-- ============================================
-- RLS POLICIES: DEALS
-- Migration: 08
-- Description: Row Level Security policies for deals table
-- CRITICAL: Controls access to private deal data
-- ============================================

-- Anyone can read public deal data (active deals only)
CREATE POLICY "Anyone can read public deal data"
  ON deals FOR SELECT
  USING (status = 'ACTIVE');

-- CRITICAL POLICY: Private deal data access
-- Users can see private columns (full_address, vendor_details, legal_pack_url) IF:
-- 1. They are the Sourcer who created it
-- 2. OR they have an active reservation with payment_status = 'HELD_IN_ESCROW' or 'RELEASED'
CREATE POLICY "Private deal data access"
  ON deals FOR SELECT
  USING (
    auth.uid() = sourcer_id
    OR
    EXISTS (
      SELECT 1 FROM reservations
      WHERE reservations.deal_id = deals.id
      AND reservations.investor_id = auth.uid()
      AND reservations.payment_status IN ('HELD_IN_ESCROW', 'RELEASED')
    )
  );

-- Sourcers can create deals (only if verified)
CREATE POLICY "Sourcers can create deals"
  ON deals FOR INSERT
  WITH CHECK (
    auth.uid() = sourcer_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'SOURCER'
      AND verification_status = 'VERIFIED'
    )
  );

-- Sourcers can update their own deals
CREATE POLICY "Sourcers can update own deals"
  ON deals FOR UPDATE
  USING (auth.uid() = sourcer_id);

-- Sourcers can delete their own draft deals
CREATE POLICY "Sourcers can delete own draft deals"
  ON deals FOR DELETE
  USING (
    auth.uid() = sourcer_id
    AND status = 'DRAFT'
  );
