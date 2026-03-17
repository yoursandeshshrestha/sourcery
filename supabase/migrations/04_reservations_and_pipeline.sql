-- ============================================
-- RESERVATIONS AND PIPELINE TABLES
-- Migration: 04
-- Description: Create reservations and progression_pipeline tables for deal tracking
-- ============================================

-- Drop existing table if it exists (for clean reset)
DROP TABLE IF EXISTS reservations CASCADE;

-- Drop enum if exists
DROP TYPE IF EXISTS reservation_status CASCADE;

-- Create reservation status enum
CREATE TYPE reservation_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- ===== RESERVATIONS TABLE =====
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

-- ===== PROGRESSION PIPELINE TABLE =====
CREATE TABLE progression_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  current_stage pipeline_stage DEFAULT 'RESERVED',

  -- Stage tracking
  notes TEXT,
  estimated_completion_date DATE,
  actual_completion_date DATE,

  -- Stage history (JSONB array)
  stage_history JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE progression_pipeline ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_progression_pipeline_reservation_id ON progression_pipeline(reservation_id);
CREATE INDEX idx_progression_pipeline_current_stage ON progression_pipeline(current_stage);
