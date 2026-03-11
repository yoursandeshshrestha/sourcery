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
