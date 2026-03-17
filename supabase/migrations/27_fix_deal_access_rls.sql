-- Fix RLS policy to allow investors to view deals they've reserved
-- regardless of payment status (for now, until payment integration is complete)

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Private deal data access" ON deals;

-- Create updated policy that allows access for confirmed reservations
CREATE POLICY "Private deal data access"
  ON deals FOR SELECT
  USING (
    -- Sourcer can always see their own deals
    auth.uid() = sourcer_id
    OR
    -- Investors can see deals they have confirmed reservations for
    EXISTS (
      SELECT 1 FROM reservations
      WHERE reservations.deal_id = deals.id
      AND reservations.investor_id = auth.uid()
      AND reservations.status IN ('PENDING', 'CONFIRMED')
    )
  );
