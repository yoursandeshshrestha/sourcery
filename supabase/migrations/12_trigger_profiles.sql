-- ============================================
-- TRIGGER: AUTO-CREATE PROFILE
-- Migration: 12
-- Description: Automatically create profile with INVESTOR role when user signs up
-- ============================================

CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'given_name', SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'family_name', SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 2)),
    'INVESTOR' -- Default role, users can convert to SOURCER later
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, do nothing
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();
