-- ============================================================
-- Supabase Auth Trigger: Auto-create profile on user sign-up
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Function: called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'client'
  )
  ON CONFLICT (id) DO NOTHING; -- safe for Google OAuth re-logins
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: fires after a new user is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Storage: Allow authenticated users to upload to project-files
-- ============================================================

-- Allow admins to upload
CREATE POLICY "Admins can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-files' AND (SELECT is_admin()));

-- Allow admins to delete
CREATE POLICY "Admins can delete files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-files' AND (SELECT is_admin()));

-- Allow anyone to read public files
CREATE POLICY "Public can read project files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-files');
