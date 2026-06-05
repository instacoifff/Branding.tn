-- Phase 3: Supabase Storage Bucket RLS Policies for project-files

-- Drop the old overly restrictive policy if it exists
DROP POLICY IF EXISTS "Admins can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete files" ON storage.objects;

-- Allow Authenticated Users (Admins, Creatives, and Clients) to insert files
CREATE POLICY "Authenticated users can upload project files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files' 
    AND auth.uid() IS NOT NULL
  );

-- Update allows same
CREATE POLICY "Authenticated users can update project files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'project-files' 
    AND auth.uid() IS NOT NULL
  );

-- Allow Authenticated Users to delete files (Admin & Creatives mostly, but anyone authenticated can manage their own uploads if needed)
-- To be safe, we allow Admins and Creatives to delete any file.
CREATE POLICY "Admins and Creatives can delete files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-files' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'creative')
    )
  );
