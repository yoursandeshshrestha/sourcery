-- ============================================
-- INCREMENT DEAL VIEWS FUNCTION
-- Migration: 22
-- Description: Create function to safely increment deal view count
-- ============================================

CREATE OR REPLACE FUNCTION increment_deal_views(deal_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE deals
  SET view_count = view_count + 1
  WHERE id = deal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_deal_views(UUID) TO authenticated;
