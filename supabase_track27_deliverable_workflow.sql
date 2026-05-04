-- BrandingTN Track 27 — Deliverable Approve/Reject Workflow
-- Adds deliverable status tracking to files, plus a full review audit trail.

-- Add deliverable columns to files table
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS 
  deliverable_status TEXT CHECK (deliverable_status IN ('pending', 'approved', 'revision_requested')) DEFAULT NULL;

ALTER TABLE public.files ADD COLUMN IF NOT EXISTS 
  revision_note TEXT DEFAULT NULL;

ALTER TABLE public.files ADD COLUMN IF NOT EXISTS 
  reviewed_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.files ADD COLUMN IF NOT EXISTS 
  reviewed_by UUID REFERENCES public.profiles(id) DEFAULT NULL;

-- Create file_reviews table for audit trail
CREATE TABLE IF NOT EXISTS public.file_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  file_id UUID REFERENCES public.files(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) NOT NULL,
  action TEXT CHECK (action IN ('approved', 'revision_requested')) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.file_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for file_reviews
-- Clients can create reviews for files in their own projects
CREATE POLICY "Clients can review their project files" ON public.file_reviews 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.files f 
    JOIN public.projects p ON f.project_id = p.id 
    WHERE f.id = file_id AND p.client_id = auth.uid()
  )
);

-- Admins can also create reviews
CREATE POLICY "Admins can manage reviews" ON public.file_reviews 
FOR ALL USING (is_admin());

-- Anyone involved can view reviews
CREATE POLICY "Project stakeholders can view reviews" ON public.file_reviews 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.files f 
    JOIN public.projects p ON f.project_id = p.id 
    WHERE f.id = file_reviews.file_id 
    AND (p.client_id = auth.uid() OR p.creative_id = auth.uid() OR is_admin())
  )
);

-- Auto-notify when a deliverable review is submitted
CREATE OR REPLACE FUNCTION notify_on_deliverable_review()
RETURNS TRIGGER AS $$
DECLARE
  v_file_name TEXT;
  v_project_id UUID;
  v_client_id UUID;
  v_creative_id UUID;
  v_project_title TEXT;
  v_reviewer_name TEXT;
BEGIN
  -- Get file + project info
  SELECT f.file_name, f.project_id, p.client_id, p.creative_id, p.title
  INTO v_file_name, v_project_id, v_client_id, v_creative_id, v_project_title
  FROM public.files f
  JOIN public.projects p ON f.project_id = p.id
  WHERE f.id = NEW.file_id;

  -- Get reviewer name
  SELECT full_name INTO v_reviewer_name FROM public.profiles WHERE id = NEW.reviewer_id;

  -- Update the file's status
  UPDATE public.files 
  SET deliverable_status = NEW.action,
      revision_note = NEW.note,
      reviewed_at = NOW(),
      reviewed_by = NEW.reviewer_id
  WHERE id = NEW.file_id;

  -- Notify relevant parties
  IF NEW.action = 'approved' THEN
    -- Notify creative that file was approved
    IF v_creative_id IS NOT NULL AND v_creative_id != NEW.reviewer_id THEN
      INSERT INTO public.notifications (user_id, title, body)
      VALUES (v_creative_id, '✅ Deliverable Approved', 
        COALESCE(v_reviewer_name, 'Client') || ' approved "' || v_file_name || '" on ' || v_project_title);
    END IF;
  ELSIF NEW.action = 'revision_requested' THEN
    -- Notify creative about revision request
    IF v_creative_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, body)
      VALUES (v_creative_id, '🔄 Revision Requested', 
        COALESCE(v_reviewer_name, 'Client') || ' requested changes on "' || v_file_name || '": ' || COALESCE(NEW.note, 'No details provided'));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_deliverable_review ON public.file_reviews;
CREATE TRIGGER trigger_deliverable_review
AFTER INSERT ON public.file_reviews
FOR EACH ROW
EXECUTE FUNCTION notify_on_deliverable_review();
