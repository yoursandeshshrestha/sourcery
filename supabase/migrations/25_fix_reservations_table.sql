-- Drop existing table if it's incomplete
DROP TABLE IF EXISTS reservations CASCADE;

-- Drop enum if exists
DROP TYPE IF EXISTS reservation_status CASCADE;

-- Create reservation status enum
CREATE TYPE reservation_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- Create reservations table
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sourcer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  status reservation_status NOT NULL DEFAULT 'PENDING',

  -- Financial
  reservation_fee_amount DECIMAL(10, 2) NOT NULL,
  reservation_fee_paid BOOLEAN NOT NULL DEFAULT false,
  payment_intent_id TEXT, -- For Stripe integration later

  -- Metadata
  investor_notes TEXT,
  sourcer_notes TEXT,

  -- Timestamps
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(deal_id, investor_id), -- One reservation per investor per deal

  -- Ensure investor is not the sourcer
  CHECK (investor_id != sourcer_id)
);

-- Create indexes
CREATE INDEX idx_reservations_deal_id ON reservations(deal_id);
CREATE INDEX idx_reservations_investor_id ON reservations(investor_id);
CREATE INDEX idx_reservations_sourcer_id ON reservations(sourcer_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- Enable RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

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

-- Function to update deal status when reserved
CREATE OR REPLACE FUNCTION update_deal_status_on_reservation()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new reservation is created, set deal to RESERVED
  IF TG_OP = 'INSERT' AND NEW.status = 'CONFIRMED' THEN
    UPDATE deals
    SET status = 'RESERVED', updated_at = NOW()
    WHERE id = NEW.deal_id AND status = 'ACTIVE';
  END IF;

  -- When reservation is cancelled, set deal back to ACTIVE
  IF TG_OP = 'UPDATE' AND NEW.status = 'CANCELLED' AND OLD.status != 'CANCELLED' THEN
    -- Check if there are any other active reservations
    IF NOT EXISTS (
      SELECT 1 FROM reservations
      WHERE deal_id = NEW.deal_id
      AND status IN ('PENDING', 'CONFIRMED')
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

-- Create trigger
CREATE TRIGGER trigger_update_deal_status_on_reservation
AFTER INSERT OR UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_deal_status_on_reservation();

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_reservations_updated_at();
