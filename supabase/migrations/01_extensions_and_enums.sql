-- ============================================
-- EXTENSIONS AND ENUMS
-- Migration: 01
-- Description: Enable required PostgreSQL extensions and create custom enum types
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For password hashing in seed data

-- Create custom enum types
CREATE TYPE user_role AS ENUM ('INVESTOR', 'SOURCER', 'ADMIN');

CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'CANCELLED');

CREATE TYPE deal_status AS ENUM ('DRAFT', 'ACTIVE', 'RESERVED', 'COMPLETED', 'CANCELLED');

CREATE TYPE strategy_type AS ENUM ('FLIP', 'HMO', 'R2R', 'BTL', 'BRRR');

CREATE TYPE payment_status AS ENUM ('PENDING', 'HELD_IN_ESCROW', 'RELEASED', 'REFUNDED');

CREATE TYPE pipeline_stage AS ENUM (
  'RESERVED',
  'LEGALS_INSTRUCTED',
  'VALUATION',
  'MORTGAGE_OFFER',
  'EXCHANGE',
  'COMPLETION'
);
