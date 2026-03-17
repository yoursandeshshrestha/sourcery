-- ============================================
-- RLS POLICIES: RESERVATIONS AND PIPELINE
-- Migration: 09
-- Description: Row Level Security policies for reservations and progression_pipeline tables
-- ============================================

-- ===== RESERVATIONS POLICIES =====

-- Anyone can view their own reservations (as investor or sourcer)
CREATE POLICY "Users can view their own reservations"
ON reservations FOR SELECT
USING (
  auth.uid() = investor_id OR
  auth.uid() = sourcer_id OR
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'ADMIN')
);

-- Investors can create reservations
CREATE POLICY "Investors can create reservations"
ON reservations FOR INSERT
WITH CHECK (
  auth.uid() = investor_id AND
  auth.uid() IN (SELECT id FROM profiles WHERE role IN ('INVESTOR', 'SOURCER', 'ADMIN'))
);

-- Investors can update their own reservations (cancel)
CREATE POLICY "Investors can update their own reservations"
ON reservations FOR UPDATE
USING (auth.uid() = investor_id)
WITH CHECK (auth.uid() = investor_id);

-- Sourcers can update reservations for their deals (confirm, complete)
CREATE POLICY "Sourcers can update their deal reservations"
ON reservations FOR UPDATE
USING (auth.uid() = sourcer_id)
WITH CHECK (auth.uid() = sourcer_id);

-- Admins can do everything
CREATE POLICY "Admins can manage all reservations"
ON reservations FOR ALL
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'ADMIN'));

-- ===== PROGRESSION PIPELINE POLICIES =====

-- Both Investor and Sourcer can read pipeline for their reservation
CREATE POLICY "Pipeline read access for reservation parties"
  ON progression_pipeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reservations
      WHERE reservations.id = progression_pipeline.reservation_id
      AND (reservations.investor_id = auth.uid() OR reservations.sourcer_id = auth.uid())
    )
  );

-- Both Investor and Sourcer can update pipeline for their reservation
CREATE POLICY "Pipeline update access for reservation parties"
  ON progression_pipeline FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM reservations
      WHERE reservations.id = progression_pipeline.reservation_id
      AND (reservations.investor_id = auth.uid() OR reservations.sourcer_id = auth.uid())
    )
  );

-- System can create pipeline entries (after reservation)
CREATE POLICY "System can create pipeline"
  ON progression_pipeline FOR INSERT
  WITH CHECK (TRUE);
