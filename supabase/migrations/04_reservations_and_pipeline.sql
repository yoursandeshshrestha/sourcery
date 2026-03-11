-- ============================================
-- RESERVATIONS AND PIPELINE TABLES
-- Migration: 04
-- Description: Create reservations and progression_pipeline tables for deal tracking
-- ============================================

-- ===== RESERVATIONS TABLE =====
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sourcer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Payment tracking
  payment_status payment_status DEFAULT 'PENDING',
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,

  -- Legal agreement
  nda_signed BOOLEAN DEFAULT FALSE,
  nda_signed_at TIMESTAMPTZ,
  agreement_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one active reservation per deal
  CONSTRAINT unique_active_reservation UNIQUE(deal_id)
);

-- Enable Row Level Security
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_reservations_investor_id ON reservations(investor_id);
CREATE INDEX idx_reservations_deal_id ON reservations(deal_id);
CREATE INDEX idx_reservations_payment_status ON reservations(payment_status);

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
