-- Phase 4: Live Notification Engine (Resend)
-- This uses the pg_net extension to make HTTP calls to our Edge Function

-- 1. Enable pg_net if not already enabled (Requires Superuser, usually available on Supabase)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the webhook trigger function
CREATE OR REPLACE FUNCTION public.trigger_email_notification()
RETURNS TRIGGER AS $$
DECLARE
  -- Replace with your actual project URL
  webhook_url text := 'https://your-project-ref.supabase.co/functions/v1/send-email';
  auth_header text := 'Bearer YOUR_ANON_KEY'; -- Normally pass anon key to invoke function
  payload jsonb;
BEGIN
  -- Construct payload with the new notification record
  payload := jsonb_build_object(
    'record', row_to_json(NEW)
  );

  -- Make async POST request using pg_net
  PERFORM net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', auth_header
    ),
    body := payload
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Fail silently to not block DB insert, but log warning (optional)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to notifications table
DROP TRIGGER IF EXISTS on_new_notification_send_email ON public.notifications;

CREATE TRIGGER on_new_notification_send_email
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.trigger_email_notification();
