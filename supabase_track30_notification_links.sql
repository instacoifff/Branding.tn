-- BrandingTN Track 30 — Clickable Notifications Context Links
-- This script adds routing metadata to the notifications table and updates
-- the database triggers to populate these fields.

-- 1. Add context columns to notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS reference_type TEXT,
ADD COLUMN IF NOT EXISTS reference_id UUID;

-- 2. Update the message notification trigger (from Track 28)
CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id UUID;
  v_creative_id UUID;
  v_client_email TEXT;
  v_creative_email TEXT;
  v_sender_name TEXT;
  v_project_title TEXT;
  v_supabase_url TEXT;
  v_service_key TEXT;
BEGIN
  -- Get project stakeholder IDs
  SELECT client_id, creative_id, title 
  INTO v_client_id, v_creative_id, v_project_title
  FROM public.projects WHERE id = NEW.project_id;

  -- Get sender name
  SELECT full_name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;

  -- In-app notification to client (if they didn't send it)
  IF NEW.sender_id != v_client_id AND v_client_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, reference_type, reference_id)
    VALUES (
        v_client_id, 
        'New Message', 
        'You have a new project message from ' || COALESCE(v_sender_name, 'your team') || '.',
        'project',
        NEW.project_id
    );

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
                body := jsonb_build_object(
                    'type', 'new_message',
                    'email', v_client_email,
                    'user_id', v_client_id,
                    'project_id', NEW.project_id,
                    'project_name', COALESCE(v_project_title, 'Your Project'),
                    'sender_name', COALESCE(v_sender_name, 'Your team'),
                    'message_preview', left(NEW.message, 100)
                )
            );
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to invoke email edge function for client: %', SQLERRM;
      END;
    END IF;
  END IF;

  -- In-app notification to creative (if they didn't send it)
  IF NEW.sender_id != v_creative_id AND v_creative_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, reference_type, reference_id)
    VALUES (
        v_creative_id, 
        'New Message', 
        'You have a new project message from ' || COALESCE(v_sender_name, 'the client') || '.',
        'project',
        NEW.project_id
    );

    -- Fire email (best-effort)
    SELECT email INTO v_creative_email FROM public.profiles WHERE id = v_creative_id;
    IF v_creative_email IS NOT NULL THEN
      BEGIN
        v_supabase_url := current_setting('app.settings.supabase_url', true);
        v_service_key := current_setting('app.settings.service_role_key', true);
        IF v_supabase_url IS NOT NULL AND v_service_key IS NOT NULL THEN
            PERFORM net.http_post(
                url := v_supabase_url || '/functions/v1/send-email-notification',
                headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || v_service_key),
                body := jsonb_build_object(
                    'type', 'new_message',
                    'email', v_creative_email,
                    'user_id', v_creative_id,
                    'project_id', NEW.project_id,
                    'project_name', COALESCE(v_project_title, 'Assigned Project'),
                    'sender_name', COALESCE(v_sender_name, 'The client'),
                    'message_preview', left(NEW.message, 100)
                )
            );
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to invoke email edge function for creative: %', SQLERRM;
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Update task status change trigger (from Track 27/auto progression)
CREATE OR REPLACE FUNCTION notify_on_deliverable_update()
RETURNS TRIGGER AS $$
DECLARE
  v_project_title TEXT;
  v_client_id UUID;
  v_creative_id UUID;
BEGIN
  -- Get project details
  SELECT title, client_id, creative_id INTO v_project_title, v_client_id, v_creative_id 
  FROM public.projects WHERE id = NEW.project_id;

  -- 1) If status changed to 'done' -> Notify client
  IF OLD.status != 'done' AND NEW.status = 'done' THEN
    IF v_client_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, body, reference_type, reference_id)
      VALUES (
        v_client_id,
        'Task Completed',
        'The task "' || NEW.title || '" in "' || v_project_title || '" has been marked as complete.',
        'project',
        NEW.project_id
      );
    END IF;
  END IF;

  -- 2) If revision_requested is toggled -> Notify creative
  IF OLD.revision_requested IS DISTINCT FROM NEW.revision_requested AND NEW.revision_requested = TRUE THEN
    IF v_creative_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, body, reference_type, reference_id)
      VALUES (
        v_creative_id,
        'Revision Requested',
        'Client requested a revision on "' || NEW.title || '" in "' || v_project_title || '".',
        'project',
        NEW.project_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
