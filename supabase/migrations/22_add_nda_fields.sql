-- ============================================
-- ADD NDA SIGNATURE FIELDS TO RESERVATIONS
-- Migration: 22
-- Description: Add fields to track NDA signature compliance
-- ============================================

ALTER TABLE reservations
ADD COLUMN nda_signed_at TIMESTAMPTZ,
ADD COLUMN nda_signature_name TEXT,
ADD COLUMN nda_ip_address TEXT;

-- Add comments for documentation
COMMENT ON COLUMN reservations.nda_signed_at IS 'Timestamp when investor digitally signed the NDA/Reservation Agreement';
COMMENT ON COLUMN reservations.nda_signature_name IS 'Full name entered by investor as digital signature';
COMMENT ON COLUMN reservations.nda_ip_address IS 'IP address of investor when signing NDA (for legal compliance)';
