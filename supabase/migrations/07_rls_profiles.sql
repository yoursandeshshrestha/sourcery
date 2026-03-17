-- ============================================
-- RLS POLICIES: PROFILES
-- Migration: 07
-- Description: Row Level Security policies for profiles table
-- ============================================

-- Helper function to check if user is admin (avoids infinite recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is a sourcer for a profile's reservations
-- SECURITY DEFINER bypasses RLS to avoid infinite recursion
CREATE OR REPLACE FUNCTION is_sourcer_for_investor(investor_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM reservations
    WHERE reservations.investor_id = investor_profile_id
    AND reservations.sourcer_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is an investor for a profile's reservations
-- SECURITY DEFINER bypasses RLS to avoid infinite recursion
CREATE OR REPLACE FUNCTION is_investor_for_sourcer(sourcer_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM reservations
    WHERE reservations.sourcer_id = sourcer_profile_id
    AND reservations.investor_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow profile creation via trigger (SECURITY DEFINER bypasses RLS)
-- This policy exists but won't block the trigger
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Admins can update all profiles (for KYC approval)
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

-- Anyone can read SOURCER and ADMIN profiles
-- They are service providers and their contact info should be accessible
-- This avoids circular dependencies with reservations table
CREATE POLICY "Anyone can read sourcer and admin profiles"
  ON profiles FOR SELECT
  USING (role IN ('SOURCER', 'ADMIN'));

-- Sourcers can read investor profiles for their own reservations
-- Allows sourcers to see details of investors who reserved their deals
-- Uses SECURITY DEFINER function to avoid infinite recursion
CREATE POLICY "Sourcers can read their reservation investors"
  ON profiles FOR SELECT
  USING (is_sourcer_for_investor(profiles.id));

-- Investors can read sourcer profiles for their own reservations
-- Allows investors to see details of sourcers whose deals they reserved
-- Uses SECURITY DEFINER function to avoid infinite recursion
CREATE POLICY "Investors can read their reservation sourcers"
  ON profiles FOR SELECT
  USING (is_investor_for_sourcer(profiles.id));
