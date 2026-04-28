-- Branding.tn Track 19 Migration
-- Execute this natively in the Supabase SQL Editor to enforce the new Creative Assignment rules and Universal Triggers.

-- 1. Add Explicit Creative Delegation Column
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS creative_id UUID REFERENCES public.profiles(id);

-- 2. Relax Admin Visibility for production safely (in case `is_admin()` helper has cache issues)
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
CREATE POLICY "Admins can view all projects" ON public.projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Universal Notification Triggers
-- Automatically ping users when there's a new Message in the project!
CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id UUID;
  v_creative_id UUID;
  v_admin_id UUID;
BEGIN
  -- Get project stakeholder IDs
  SELECT client_id, creative_id INTO v_client_id, v_creative_id 
  FROM public.projects WHERE id = NEW.project_id;

  -- Notify Client if they didn't send it
  IF NEW.sender_id != v_client_id AND v_client_id IS NOT NULL THEN
     INSERT INTO public.notifications (user_id, title, body)
     VALUES (v_client_id, 'New Message', 'You have a new project message waiting.');
  END IF;

  -- Notify Creative if they didn't send it
  IF NEW.sender_id != v_creative_id AND v_creative_id IS NOT NULL THEN
     INSERT INTO public.notifications (user_id, title, body)
     VALUES (v_creative_id, 'New Message', 'You have a new project message waiting.');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_new_message ON public.project_messages;
CREATE TRIGGER trigger_new_message
AFTER INSERT ON public.project_messages
FOR EACH ROW EXECUTE FUNCTION notify_on_new_message();

-- Ping users when a task is allocated
CREATE OR REPLACE FUNCTION notify_on_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  v_creative_profile UUID;
BEGIN
  -- We try to map the new assigned_to (team_member) to a genuine profile via full_name matching
  SELECT p.id INTO v_creative_profile 
  FROM public.profiles p
  JOIN public.team_members tm ON LOWER(tm.name) = LOWER(p.full_name)
  WHERE tm.id = NEW.assigned_to 
  LIMIT 1;

  IF v_creative_profile IS NOT NULL THEN
     INSERT INTO public.notifications (user_id, title, body)
     VALUES (v_creative_profile, 'New Task Assigned', 'A new task was allocated to your queue.');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_new_task ON public.tasks;
CREATE TRIGGER trigger_new_task
AFTER INSERT OR UPDATE OF assigned_to ON public.tasks
FOR EACH ROW
WHEN (NEW.assigned_to IS NOT NULL)
EXECUTE FUNCTION notify_on_task_assignment();
