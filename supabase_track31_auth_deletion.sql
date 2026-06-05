-- Phase 1: Database-Enforced Profile Deletion
-- Ensures deleting a profile from the CRM automatically cleans up the auth.users credential

CREATE OR REPLACE FUNCTION public.handle_deleted_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the user from auth.users securely
  -- Using SECURITY DEFINER bypasses RLS allowing system-level deletion
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_profile_deleted ON public.profiles;

-- Create the trigger to fire AFTER a profile is deleted
CREATE TRIGGER on_profile_deleted
  AFTER DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_deleted_profile();
