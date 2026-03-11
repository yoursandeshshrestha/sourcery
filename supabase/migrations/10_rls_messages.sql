-- ============================================
-- RLS POLICIES: MESSAGES
-- Migration: 10
-- Description: Row Level Security policies for messages table
-- ============================================

-- Users can read messages for deals they're involved in
CREATE POLICY "Users can read messages for their deals"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = messages.deal_id
      AND (
        deals.sourcer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM reservations
          WHERE reservations.deal_id = deals.id
          AND reservations.investor_id = auth.uid()
        )
      )
    )
  );

-- Users can send messages for deals they're involved in
CREATE POLICY "Users can send messages for their deals"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = messages.deal_id
      AND (
        deals.sourcer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM reservations
          WHERE reservations.deal_id = deals.id
          AND reservations.investor_id = auth.uid()
        )
      )
    )
  );
