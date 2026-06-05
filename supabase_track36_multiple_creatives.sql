-- ============================================================
-- Track 36: Multiple Creatives per Project Migration
-- Replaces single creative_id with a project_creatives junction table
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Create junction table
CREATE TABLE IF NOT EXISTS public.project_creatives (
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    creative_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (project_id, creative_id)
);

-- 2. Migrate existing assignments
INSERT INTO public.project_creatives (project_id, creative_id)
SELECT id, creative_id FROM public.projects WHERE creative_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Enable RLS on junction table
ALTER TABLE public.project_creatives ENABLE ROW LEVEL SECURITY;

-- Admins can do anything
CREATE POLICY "Admins can manage project_creatives" 
ON public.project_creatives FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Creatives can see their own assignments
CREATE POLICY "Creatives can view their assignments" 
ON public.project_creatives FOR SELECT 
USING (creative_id = auth.uid());

-- Clients can see creatives assigned to their projects
CREATE POLICY "Clients can view creatives on their projects" 
ON public.project_creatives FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = project_creatives.project_id AND client_id = auth.uid()));

-- 4. Update RLS policies on other tables

-- Projects
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT
USING (
    client_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.project_creatives WHERE project_id = id AND creative_id = auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Tasks
DROP POLICY IF EXISTS "Admins and assigned users can manage tasks" ON public.tasks;
CREATE POLICY "Admins and assigned users can manage tasks" ON public.tasks FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
  EXISTS (SELECT 1 FROM public.project_creatives WHERE project_id = tasks.project_id AND creative_id = auth.uid())
);

-- Files
DROP POLICY IF EXISTS "Admins and assigned users can view files" ON public.files;
CREATE POLICY "Admins and assigned users can view files" ON public.files FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = files.project_id AND client_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.project_creatives WHERE project_id = files.project_id AND creative_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins and assigned creatives can manage files" ON public.files;
CREATE POLICY "Admins and assigned creatives can manage files" ON public.files FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
  EXISTS (SELECT 1 FROM public.project_creatives WHERE project_id = files.project_id AND creative_id = auth.uid())
);

-- Project Messages
DROP POLICY IF EXISTS "Users can view messages for their projects" ON public.project_messages;
CREATE POLICY "Users can view messages for their projects" ON public.project_messages FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_messages.project_id AND client_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.project_creatives WHERE project_id = project_messages.project_id AND creative_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users can insert messages for their projects" ON public.project_messages;
CREATE POLICY "Users can insert messages for their projects" ON public.project_messages FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_messages.project_id AND client_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.project_creatives WHERE project_id = project_messages.project_id AND creative_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Update Triggers to loop through project_creatives

-- notify_on_new_message (From Track 30)
CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id UUID;
  v_client_email TEXT;
  v_sender_name TEXT;
  v_project_title TEXT;
  v_supabase_url TEXT;
  v_service_key TEXT;
  v_creative_rec RECORD;
BEGIN
  -- Get project stakeholder IDs
  SELECT client_id, title INTO v_client_id, v_project_title FROM public.projects WHERE id = NEW.project_id;
  SELECT full_name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;

  -- In-app notification to client (if they didn't send it)
  IF NEW.sender_id != v_client_id AND v_client_id IS NOT NULL THEN
    -- Prevent internal notes from reaching client
    IF NOT COALESCE(NEW.is_internal, false) THEN
        INSERT INTO public.notifications (user_id, title, body, reference_type, reference_id)
        VALUES (v_client_id, 'New Message', 'You have a new project message from ' || COALESCE(v_sender_name, 'your team') || '.', 'project', NEW.project_id);

        -- Fire email (best-effort)
        SELECT email INTO v_client_email FROM public.profiles WHERE id = v_client_id;
        IF v_client_email IS NOT NULL THEN
          BEGIN
            v_supabase_url := current_setting('app.settings.supabase_url', true);
            v_service_key := current_setting('app.settings.service_role_key', true);
            IF v_supabase_url IS NOT NULL AND v_service_key IS NOT NULL THEN
                PERFORM net.http_post(
                    url := v_supabase_url || '/functions/v1/send-email-notification',
                    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_service_key),
                    body := jsonb_build_object('type', 'new_message', 'email', v_client_email, 'user_id', v_client_id, 'project_id', NEW.project_id, 'project_name', COALESCE(v_project_title, 'Your Project'), 'sender_name', COALESCE(v_sender_name, 'Your team'), 'message_preview', left(NEW.message, 100))
                );
            END IF;
          EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed to invoke email edge function for client: %', SQLERRM;
          END;
        END IF;
    END IF;
  END IF;

  -- Notify all assigned creatives
  FOR v_creative_rec IN SELECT creative_id FROM public.project_creatives WHERE project_id = NEW.project_id LOOP
      IF NEW.sender_id != v_creative_rec.creative_id THEN
        INSERT INTO public.notifications (user_id, title, body, reference_type, reference_id)
        VALUES (v_creative_rec.creative_id, 'New Message', 'You have a new project message from ' || COALESCE(v_sender_name, 'the client') || '.', 'project', NEW.project_id);

        -- Fire email (best-effort)
        SELECT email INTO v_client_email FROM public.profiles WHERE id = v_creative_rec.creative_id;
        IF v_client_email IS NOT NULL THEN
          BEGIN
            v_supabase_url := current_setting('app.settings.supabase_url', true);
            v_service_key := current_setting('app.settings.service_role_key', true);
            IF v_supabase_url IS NOT NULL AND v_service_key IS NOT NULL THEN
                PERFORM net.http_post(
                    url := v_supabase_url || '/functions/v1/send-email-notification',
                    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_service_key),
                    body := jsonb_build_object('type', 'new_message', 'email', v_client_email, 'user_id', v_creative_rec.creative_id, 'project_id', NEW.project_id, 'project_name', COALESCE(v_project_title, 'Assigned Project'), 'sender_name', COALESCE(v_sender_name, 'The client'), 'message_preview', left(NEW.message, 100))
                );
            END IF;
          EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Failed to invoke email edge function for creative: %', SQLERRM;
          END;
        END IF;
      END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- notify_on_deliverable_update (From Track 30)
CREATE OR REPLACE FUNCTION notify_on_deliverable_update()
RETURNS TRIGGER AS $$
DECLARE
  v_project_title TEXT;
  v_client_id UUID;
  v_creative_rec RECORD;
BEGIN
  SELECT title, client_id INTO v_project_title, v_client_id FROM public.projects WHERE id = NEW.project_id;

  -- 1) If status changed to 'done' -> Notify client
  IF OLD.status != 'done' AND NEW.status = 'done' THEN
    IF v_client_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, body, reference_type, reference_id)
      VALUES (v_client_id, 'Task Completed', 'The task "' || NEW.title || '" in "' || v_project_title || '" has been marked as complete.', 'project', NEW.project_id);
    END IF;
  END IF;

  -- 2) If revision_requested is toggled -> Notify creatives
  IF OLD.revision_requested IS DISTINCT FROM NEW.revision_requested AND NEW.revision_requested = TRUE THEN
    FOR v_creative_rec IN SELECT creative_id FROM public.project_creatives WHERE project_id = NEW.project_id LOOP
        INSERT INTO public.notifications (user_id, title, body, reference_type, reference_id)
        VALUES (v_creative_rec.creative_id, 'Revision Requested', 'Client requested a revision on "' || NEW.title || '" in "' || v_project_title || '".', 'project', NEW.project_id);
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- notify_on_file_review (From Track 27)
CREATE OR REPLACE FUNCTION notify_on_file_review()
RETURNS TRIGGER AS $$
DECLARE
  v_file_name TEXT;
  v_project_id UUID;
  v_client_id UUID;
  v_project_title TEXT;
  v_creative_rec RECORD;
BEGIN
  -- Only trigger if deliverable_status changed
  IF OLD.deliverable_status IS NOT DISTINCT FROM NEW.deliverable_status THEN RETURN NEW; END IF;

  SELECT f.file_name, f.project_id, p.client_id, p.title INTO v_file_name, v_project_id, v_client_id, v_project_title
  FROM public.files f JOIN public.projects p ON f.project_id = p.id WHERE f.id = NEW.id;

  -- If status is 'pending' (newly uploaded by creative) -> Notify client
  IF NEW.deliverable_status = 'pending' THEN
    IF v_client_id IS NOT NULL AND v_client_id != NEW.reviewer_id THEN
      INSERT INTO public.notifications (user_id, title, body)
      VALUES (v_client_id, 'New Deliverable for Review', 'A new file "' || v_file_name || '" in "' || v_project_title || '" needs your review.');
    END IF;
  END IF;

  -- If status is 'approved' -> Notify creatives
  IF NEW.deliverable_status = 'approved' THEN
    FOR v_creative_rec IN SELECT creative_id FROM public.project_creatives WHERE project_id = v_project_id LOOP
      IF v_creative_rec.creative_id != NEW.reviewer_id THEN
        INSERT INTO public.notifications (user_id, title, body)
        VALUES (v_creative_rec.creative_id, '✅ Deliverable Approved', 'The client approved "' || v_file_name || '" in "' || v_project_title || '".');
      END IF;
    END LOOP;
  END IF;

  -- If status is 'revision_requested' -> Notify creatives
  IF NEW.deliverable_status = 'revision_requested' THEN
    FOR v_creative_rec IN SELECT creative_id FROM public.project_creatives WHERE project_id = v_project_id LOOP
      INSERT INTO public.notifications (user_id, title, body)
      VALUES (v_creative_rec.creative_id, '🔄 Revision Requested', 'The client requested a revision for "' || v_file_name || '" in "' || v_project_title || '".');
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
