-- ============================================
-- TRIGGER: CONTACT INFO BLOCKING
-- Migration: 13
-- Description: Block messages containing contact info before reservation
-- ============================================

CREATE OR REPLACE FUNCTION check_contact_info()
RETURNS TRIGGER AS $$
DECLARE
  has_reservation BOOLEAN;
  contains_phone BOOLEAN;
  contains_email BOOLEAN;
BEGIN
  -- Check if deal has a paid reservation
  SELECT EXISTS (
    SELECT 1 FROM reservations
    WHERE deal_id = NEW.deal_id
    AND payment_status IN ('HELD_IN_ESCROW', 'RELEASED')
  ) INTO has_reservation;

  -- If no reservation, check for contact info
  IF NOT has_reservation THEN
    -- Check for UK phone numbers (patterns: +44, 07XXXXXXXXX, or 11 digits)
    SELECT NEW.content ~* '(\+44|07\d{9}|\d{11})' INTO contains_phone;

    -- Check for email addresses
    SELECT NEW.content ~* '[\w\.-]+@[\w\.-]+\.\w+' INTO contains_email;

    IF contains_phone OR contains_email THEN
      NEW.is_flagged := TRUE;
      RAISE EXCEPTION 'Contact information sharing is not allowed before deal reservation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER block_contact_sharing
  BEFORE INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION check_contact_info();
