-- ============================================
-- DEALS TABLE
-- Migration: 03
-- Description: Create deals table for property listings
-- ============================================

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sourcer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status deal_status DEFAULT 'DRAFT',

  -- Public metadata (visible to all)
  headline TEXT NOT NULL,
  description TEXT,
  strategy_type strategy_type NOT NULL,
  approximate_location TEXT NOT NULL,
  capital_required DECIMAL(12, 2) NOT NULL,

  -- Calculated metrics (computed server-side)
  calculated_roi DECIMAL(5, 2),
  calculated_yield DECIMAL(5, 2),
  calculated_roce DECIMAL(5, 2),

  -- Private data (RLS protected - only visible after payment)
  full_address TEXT NOT NULL,
  vendor_details JSONB,
  legal_pack_url TEXT,

  -- Financial metrics (JSONB for flexibility)
  financial_metrics JSONB NOT NULL,

  -- Media
  media_urls TEXT[],
  thumbnail_url TEXT,

  -- Fees
  reservation_fee DECIMAL(10, 2) DEFAULT 3000.00,
  sourcing_fee DECIMAL(10, 2) NOT NULL,

  -- Metadata
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_deals_sourcer_id ON deals(sourcer_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_strategy_type ON deals(strategy_type);
CREATE INDEX idx_deals_created_at ON deals(created_at DESC);

-- Full-text search index
CREATE INDEX idx_deals_search ON deals
  USING gin(to_tsvector('english', headline || ' ' || COALESCE(description, '')));
