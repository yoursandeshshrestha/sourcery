-- ============================================
-- HELPER FUNCTIONS
-- Migration: 16
-- Description: Utility functions for common operations
-- ============================================

-- Function to check if user can access private deal data
CREATE OR REPLACE FUNCTION can_access_private_deal_data(deal_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM deals
    WHERE id = deal_id
    AND (
      sourcer_id = user_id
      OR EXISTS (
        SELECT 1 FROM reservations
        WHERE reservations.deal_id = deals.id
        AND reservations.investor_id = user_id
        AND reservations.payment_status IN ('HELD_IN_ESCROW', 'RELEASED')
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get deal visibility status for a user
CREATE OR REPLACE FUNCTION get_deal_visibility(deal_id UUID, user_id UUID)
RETURNS TEXT AS $$
DECLARE
  visibility TEXT;
BEGIN
  -- Check if user is the sourcer
  IF EXISTS (SELECT 1 FROM deals WHERE id = deal_id AND sourcer_id = user_id) THEN
    RETURN 'full';
  END IF;

  -- Check if user has paid reservation
  IF EXISTS (
    SELECT 1 FROM reservations
    WHERE deal_id = deal_id
    AND investor_id = user_id
    AND payment_status IN ('HELD_IN_ESCROW', 'RELEASED')
  ) THEN
    RETURN 'full';
  END IF;

  -- Default: public view only
  RETURN 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if deal can be reserved
CREATE OR REPLACE FUNCTION can_reserve_deal(deal_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM deals
    WHERE id = deal_id
    AND status = 'ACTIVE'
    AND NOT EXISTS (
      SELECT 1 FROM reservations
      WHERE reservations.deal_id = deals.id
      AND payment_status IN ('HELD_IN_ESCROW', 'RELEASED')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
