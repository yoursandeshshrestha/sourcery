-- Update existing messages table to add new columns for messaging system

-- Add missing columns
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create index for unread messages
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(reservation_id, is_read) WHERE is_read = false;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS messages_updated_at ON messages;
CREATE TRIGGER messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();

-- Update RLS policies (drop old ones first if they exist)
DROP POLICY IF EXISTS "Users can read messages for their reservations" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their reservations" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their reservations" ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
DROP POLICY IF EXISTS "Admins have full access to messages" ON messages;

-- Users can read messages for reservations they're part of (as investor or sourcer)
CREATE POLICY "Users can read messages for their reservations"
  ON messages
  FOR SELECT
  USING (
    reservation_id IN (
      SELECT id FROM reservations
      WHERE investor_id = auth.uid()
         OR sourcer_id = auth.uid()
    )
  );

-- Users can send messages to reservations they're part of
CREATE POLICY "Users can send messages to their reservations"
  ON messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND reservation_id IN (
      SELECT id FROM reservations
      WHERE investor_id = auth.uid()
         OR sourcer_id = auth.uid()
    )
  );

-- Users can update messages in their reservations
CREATE POLICY "Users can update messages in their reservations"
  ON messages
  FOR UPDATE
  USING (
    reservation_id IN (
      SELECT id FROM reservations
      WHERE investor_id = auth.uid()
         OR sourcer_id = auth.uid()
    )
  );

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON messages
  FOR DELETE
  USING (sender_id = auth.uid());

-- Admin can do everything
CREATE POLICY "Admins have full access to messages"
  ON messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role = 'ADMIN'
    )
  );

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(p_reservation_id UUID, p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET is_read = true,
      read_at = now()
  WHERE reservation_id = p_reservation_id
    AND sender_id != p_user_id
    AND is_read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION mark_messages_as_read TO authenticated;

-- Enable Realtime for messages table (if not already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
