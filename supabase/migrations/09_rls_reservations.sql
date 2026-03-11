-- ============================================
-- RLS POLICIES: RESERVATIONS AND PIPELINE
-- Migration: 09
-- Description: Row Level Security policies for reservations and progression_pipeline tables
-- ============================================

-- ===== RESERVATIONS POLICIES =====

-- Investors can read their own reservations
CREATE POLICY "Investors can read own reservations"
  ON reservations FOR SELECT
  USING (auth.uid() = investor_id);

-- Sourcers can read reservations for their deals
CREATE POLICY "Sourcers can read deal reservations"
  ON reservations FOR SELECT
  USING (auth.uid() = sourcer_id);

-- Investors can create reservations
CREATE POLICY "Investors can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (auth.uid() = investor_id);

-- System/Admin can update reservation status (for webhook handling)
CREATE POLICY "System can update reservations"
  ON reservations FOR UPDATE
  USING (TRUE);

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
