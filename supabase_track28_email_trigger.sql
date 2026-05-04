-- BrandingTN Track 28 — Email Notification Trigger via pg_net
-- This extends the existing notify_on_new_message() trigger to also fire
-- an HTTP request to the send-email-notification Edge Function.
--
-- Prerequisites:
--   1. Enable the pg_net extension: CREATE EXTENSION IF NOT EXISTS pg_net;
--   2. Set app.settings.service_role_key in Supabase dashboard
--   3. Deploy the send-email-notification Edge Function
--   4. Add email column to profiles (or use auth.users.email)

-- Ensure pg_net is enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Add email column to profiles if not exists (for easy lookup)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Update the message notification trigger to also send emails
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
    INSERT INTO public.notifications (user_id, title, body)
    VALUES (v_client_id, 'New Message', 'You have a new project message from ' || COALESCE(v_sender_name, 'your team') || '.');

    -- Fire email (best-effort, non-blocking)
    SELECT email INTO v_client_email FROM public.profiles WHERE id = v_client_id;
    IF v_client_email IS NOT NULL THEN
      BEGIN
        v_supabase_url := current_setting('app.settings.supabase_url', true);
        v_service_key := current_setting('app.settings.service_role_key', true);
        
        IF v_supabase_url IS NOT NULL AND v_service_key IS NOT NULL THEN
          PERFORM net.http_post(
            url := v_supabase_url || '/functions/v1/send-email-notification',
            body := json_build_object(
              'to', v_client_email,
              'subject', COALESCE(v_sender_name, 'BrandingTN') || ' sent you a message',
              'senderName', v_sender_name,
              'projectName', v_project_title,
              'messagePreview', LEFT(NEW.message, 200),
              'actionUrl', 'https://branding.tn/dashboard/projects/' || NEW.project_id
            )::text,
            headers := json_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || v_service_key
            )::jsonb
          );
        END IF;
      EXCEPTION WHEN OTHERS THEN
        -- Email is non-critical, don't block the trigger
        RAISE WARNING 'Email notification failed: %', SQLERRM;
      END;
    END IF;
  END IF;

  -- In-app notification to creative (if they didn't send it)
  IF NEW.sender_id != v_creative_id AND v_creative_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body)
    VALUES (v_creative_id, 'New Message', 'You have a new project message from ' || COALESCE(v_sender_name, 'the client') || '.');

    -- Fire email for creative too
    SELECT email INTO v_creative_email FROM public.profiles WHERE id = v_creative_id;
    IF v_creative_email IS NOT NULL THEN
      BEGIN
        v_supabase_url := current_setting('app.settings.supabase_url', true);
        v_service_key := current_setting('app.settings.service_role_key', true);

        IF v_supabase_url IS NOT NULL AND v_service_key IS NOT NULL THEN
          PERFORM net.http_post(
            url := v_supabase_url || '/functions/v1/send-email-notification',
            body := json_build_object(
              'to', v_creative_email,
              'subject', COALESCE(v_sender_name, 'BrandingTN') || ' sent a message on ' || v_project_title,
              'senderName', v_sender_name,
              'projectName', v_project_title,
              'messagePreview', LEFT(NEW.message, 200),
              'actionUrl', 'https://branding.tn/dashboard/projects/' || NEW.project_id
            )::text,
            headers := json_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer ' || v_service_key
            )::jsonb
          );
        END IF;
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Email notification failed: %', SQLERRM;
      END;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-bind the trigger
DROP TRIGGER IF EXISTS trigger_new_message ON public.project_messages;
CREATE TRIGGER trigger_new_message
AFTER INSERT ON public.project_messages
FOR EACH ROW EXECUTE FUNCTION notify_on_new_message();
