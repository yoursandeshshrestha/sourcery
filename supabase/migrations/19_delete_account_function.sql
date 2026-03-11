-- ============================================
-- DELETE ACCOUNT FUNCTION
-- Migration: 19
-- Description: Function to allow users to delete their own account
-- ============================================

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user's profile (cascade will handle related data)
  DELETE FROM public.profiles WHERE id = user_id;

  -- Delete the user from auth.users (requires SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
