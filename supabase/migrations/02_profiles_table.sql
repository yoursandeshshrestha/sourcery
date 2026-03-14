-- ============================================
-- PROFILES TABLE
-- Migration: 02
-- Description: Create profiles table that extends auth.users
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'INVESTOR',
  verification_status verification_status DEFAULT NULL,

  -- Basic info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  bio TEXT,
  avatar_url TEXT,

  -- Sourcer-specific fields
  id_document_url TEXT,
  aml_document_url TEXT,
  insurance_document_url TEXT,
  stripe_connected_account_id TEXT,
  stripe_onboarding_completed BOOLEAN DEFAULT FALSE,

  -- Investor-specific fields
  stripe_customer_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_verification_status ON profiles(verification_status);
