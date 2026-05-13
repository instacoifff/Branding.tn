-- 1. Make basic profiles readable by all authenticated users so names appear in chat instead of 'Unknown'
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);

-- 2. Create a secure helper function to check project access without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.can_access_project_messages(p_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects 
    WHERE id = p_id 
    AND (client_id = auth.uid() OR creative_id = auth.uid() OR is_admin())
  );
$$;

-- 3. Grant creatives access to view project messages
DROP POLICY IF EXISTS "Users can view project_messages" ON public.project_messages;
CREATE POLICY "Users can view project_messages" ON public.project_messages FOR SELECT TO authenticated USING (
  public.can_access_project_messages(project_id)
);

-- 4. Grant creatives access to send project messages
DROP POLICY IF EXISTS "Users can send project_messages" ON public.project_messages;
CREATE POLICY "Users can send project_messages" ON public.project_messages FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = sender_id AND
  public.can_access_project_messages(project_id)
);

-- 5. Enable Realtime for project_messages so replies appear instantly without refreshing
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_messages;
