-- BrandingTN Track 37 — Fix Auto Progression for Multiple Creatives
-- Update the trigger to loop over project_creatives instead of the deprecated projects.creative_id

CREATE OR REPLACE FUNCTION auto_progress_project_stage()
RETURNS TRIGGER AS $$
DECLARE
  v_project_id UUID;
  v_total_tasks INT;
  v_done_tasks INT;
  v_current_stage INT;
  v_auto_progress BOOLEAN;
  v_client_id UUID;
  v_project_title TEXT;
  v_creative_rec RECORD;
  stage_labels TEXT[] := ARRAY['Brief','Concepts','Refinement','Finalisation','Delivery'];
BEGIN
  v_project_id := NEW.project_id;
  
  -- Count tasks
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'done')
  INTO v_total_tasks, v_done_tasks
  FROM public.tasks WHERE project_id = v_project_id;
  
  -- Only progress if ALL tasks are done and there are tasks
  IF v_total_tasks > 0 AND v_done_tasks = v_total_tasks THEN
    SELECT current_stage, client_id, title, auto_progress
    INTO v_current_stage, v_client_id, v_project_title, v_auto_progress
    FROM public.projects WHERE id = v_project_id;
    
    -- Respect the per-project override
    IF v_auto_progress IS FALSE THEN
      RETURN NEW;
    END IF;
    
    -- Auto-advance stage (max 5)
    IF v_current_stage < 5 THEN
      UPDATE public.projects 
      SET current_stage = v_current_stage + 1, 
          updated_at = NOW(),
          -- Auto-activate if moving past onboarding
          status = CASE 
            WHEN v_current_stage = 1 AND status = 'onboarding' THEN 'active'
            WHEN v_current_stage + 1 = 5 THEN 'completed'
            ELSE status
          END
      WHERE id = v_project_id;
      
      -- Notify client
      IF v_client_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, body)
        VALUES (
          v_client_id, 
          v_project_title || ' — Stage Complete!',
          'Your project has moved to ' || stage_labels[v_current_stage + 1] || '. Check your dashboard for updates!'
        );
      END IF;
      
      -- Notify all creatives assigned to the project
      FOR v_creative_rec IN SELECT creative_id FROM public.project_creatives WHERE project_id = v_project_id LOOP
        INSERT INTO public.notifications (user_id, title, body)
        VALUES (
          v_creative_rec.creative_id,
          v_project_title || ' — Stage Advanced',
          'All tasks done! Project moved to ' || stage_labels[v_current_stage + 1] || '.'
        );
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
