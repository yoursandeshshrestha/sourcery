-- ============================================
-- FIX RESERVATION RACE CONDITION
-- Migration: 16
-- Description: Fix reservation flow to prevent deals being locked by abandoned checkouts
--              New approach: Reservations are only created AFTER successful payment
-- ============================================

-- Update trigger to only lock deals on CONFIRMED status
-- This ensures deals are only locked when payment is actually completed
CREATE OR REPLACE FUNCTION update_deal_status_on_reservation()
RETURNS TRIGGER AS $$
BEGIN
  -- When a reservation is created or updated to CONFIRMED, set deal to RESERVED
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.status = 'CONFIRMED' AND (TG_OP = 'INSERT' OR OLD.status != 'CONFIRMED') THEN
    UPDATE deals
    SET status = 'RESERVED', updated_at = NOW()
    WHERE id = NEW.deal_id AND status = 'ACTIVE';
  END IF;

  -- When reservation is cancelled, set deal back to ACTIVE
  IF TG_OP = 'UPDATE' AND NEW.status = 'CANCELLED' AND OLD.status != 'CANCELLED' THEN
    -- Check if there are any other confirmed reservations
    IF NOT EXISTS (
      SELECT 1 FROM reservations
      WHERE deal_id = NEW.deal_id
      AND status = 'CONFIRMED'
      AND id != NEW.id
    ) THEN
      UPDATE deals
      SET status = 'ACTIVE', updated_at = NOW()
      WHERE id = NEW.deal_id AND status = 'RESERVED';
    END IF;
  END IF;

  -- When reservation is completed, set deal to COMPLETED
  IF TG_OP = 'UPDATE' AND NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
    UPDATE deals
    SET status = 'COMPLETED', updated_at = NOW()
    WHERE id = NEW.deal_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the new flow
COMMENT ON TABLE reservations IS 'Reservations are created with CONFIRMED status after successful payment. This prevents abandoned checkouts from locking deals.';
