-- ============================================
-- RLS POLICIES: DAN'S LEADS
-- Migration: 11
-- Description: Row Level Security policies for dans_leads and lead_purchases tables
-- ============================================

-- ===== DAN'S LEADS POLICIES =====

-- Anyone can read public lead data
CREATE POLICY "Anyone can read public leads"
  ON dans_leads FOR SELECT
  USING (TRUE);

-- Admins can create leads
CREATE POLICY "Admins can create leads"
  ON dans_leads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admins can update leads
CREATE POLICY "Admins can update leads"
  ON dans_leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admins can delete leads
CREATE POLICY "Admins can delete leads"
  ON dans_leads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ===== LEAD PURCHASES POLICIES =====

-- Users can read their own purchases
CREATE POLICY "Users can read own purchases"
  ON lead_purchases FOR SELECT
  USING (auth.uid() = buyer_id);

-- Admins can read all purchases
CREATE POLICY "Admins can read all purchases"
  ON lead_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Users can create purchases
CREATE POLICY "Users can create purchases"
  ON lead_purchases FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);
