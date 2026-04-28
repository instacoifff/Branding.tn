-- Branding.tn Track 20 Migration
-- Respond.io CRM Unified Inbox Upgrades

-- 1. Add "Internal Notes" capability to the messaging thread
ALTER TABLE public.project_messages ADD COLUMN IF NOT EXISTS is_internal BOOLEAN DEFAULT false;

-- Note: No RLS changes are strictly needed if we map standard selection to filter out 'is_internal = true' for the client side.
-- Wait, let's explicitly add a policy to prevent clients from retrieving internal messages:
-- Actually, the easiest way to prevent clients from reading internal messages is via the Supabase client query. 
-- But for absolute security, we should modify the "Clients can view their messages" policy if they had one.
-- Currently, we don't have a rigid select policy on project_messages restricted by `is_internal`. The schema was:
-- (Assuming project_messages was tracked, let's just make sure clients can't read internal notes!)

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'project_messages' AND policyname = 'Hide internal messages from clients'
    ) THEN
        CREATE POLICY "Hide internal messages from clients" ON public.project_messages 
        FOR SELECT USING (
            -- If you are client, it must NOT be internal. If you are admin/creative, you can view all.
            is_internal = false 
            OR 
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'creative'))
        );
    END IF;
END $$;
