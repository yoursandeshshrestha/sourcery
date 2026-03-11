-- ============================================
-- DAN'S LEADS TABLES
-- Migration: 06
-- Description: Create tables for secondary marketplace (Dan's Leads)
-- ============================================

-- ===== DAN'S LEADS TABLE =====
CREATE TABLE dans_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Public info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  property_type TEXT,
  price DECIMAL(10, 2) NOT NULL,

  -- Private data (unlocked after purchase)
  full_details JSONB NOT NULL,

  is_sold BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE dans_leads ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_dans_leads_is_sold ON dans_leads(is_sold);
CREATE INDEX idx_dans_leads_created_at ON dans_leads(created_at DESC);

-- ===== LEAD PURCHASES TABLE =====
CREATE TABLE lead_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES dans_leads(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  stripe_payment_intent_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one purchase per user per lead
  CONSTRAINT unique_lead_purchase UNIQUE(lead_id, buyer_id)
);

-- Enable Row Level Security
ALTER TABLE lead_purchases ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_lead_purchases_buyer_id ON lead_purchases(buyer_id);
CREATE INDEX idx_lead_purchases_lead_id ON lead_purchases(lead_id);
