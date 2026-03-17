-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can read sourcer profiles for reserved deals" ON profiles;
DROP POLICY IF EXISTS "Anyone can read public sourcer info" ON profiles;

-- Simple approach: Allow anyone to read SOURCER and ADMIN profiles
-- They are service providers and their contact info should be accessible
-- This avoids circular dependencies with reservations table
CREATE POLICY "Anyone can read sourcer and admin profiles"
  ON profiles FOR SELECT
  USING (role IN ('SOURCER', 'ADMIN'));
