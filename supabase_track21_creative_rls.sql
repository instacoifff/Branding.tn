-- Branding.tn Track 21 Migration
-- Execute this natively in the Supabase SQL Editor to fix the visibility bug for Creatives!

-- 1. Grant Creatives access to view their assigned projects
DROP POLICY IF EXISTS "Creatives can view assigned projects" ON public.projects;
CREATE POLICY "Creatives can view assigned projects" ON public.projects FOR SELECT USING (
  auth.uid() = creative_id
);

-- 2. Grant Creatives access to view tasks for their assigned projects
DROP POLICY IF EXISTS "Creatives can view tasks for assigned projects" ON public.tasks;
CREATE POLICY "Creatives can view tasks for assigned projects" ON public.tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = tasks.project_id AND creative_id = auth.uid())
);

-- 3. Grant Creatives access to view files for their assigned projects
DROP POLICY IF EXISTS "Creatives can view files for assigned projects" ON public.files;
CREATE POLICY "Creatives can view files for assigned projects" ON public.files FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = files.project_id AND creative_id = auth.uid())
);

-- 4. Grant Creatives access to view project_messages for their assigned projects
DROP POLICY IF EXISTS "Creatives can view project_messages for assigned projects" ON public.project_messages;
CREATE POLICY "Creatives can view project_messages for assigned projects" ON public.project_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_messages.project_id AND creative_id = auth.uid())
);

-- 5. Grant Creatives ability to insert project messages (if they wasn't already a blanket policy)
DROP POLICY IF EXISTS "Creatives can send project_messages" ON public.project_messages;
CREATE POLICY "Creatives can send project_messages" ON public.project_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_messages.project_id AND creative_id = auth.uid())
);
