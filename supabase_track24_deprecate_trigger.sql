-- BrandingTN Track 24 — Fix Task Assignment Trigger
-- The old trigger in Track 19 joined team_members by name matching.
-- Now that tasks.assigned_to references profiles(id), the trigger is simplified.

CREATE OR REPLACE FUNCTION notify_on_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- assigned_to now directly references profiles(id), so no name-matching needed
  IF NEW.assigned_to IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body)
    VALUES (
      NEW.assigned_to,
      'New Task Assigned',
      'A new task was allocated to your queue. Check your Creative Dashboard.'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-bind the trigger (idempotent)
DROP TRIGGER IF EXISTS trigger_new_task ON public.tasks;
CREATE TRIGGER trigger_new_task
AFTER INSERT OR UPDATE OF assigned_to ON public.tasks
FOR EACH ROW
WHEN (NEW.assigned_to IS NOT NULL)
EXECUTE FUNCTION notify_on_task_assignment();
