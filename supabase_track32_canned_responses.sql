-- Phase 2: Canned Responses Database Schema
CREATE TABLE IF NOT EXISTS public.canned_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shortcut TEXT NOT NULL UNIQUE,
    response_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.canned_responses ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone authenticated can view canned responses (to use them)
CREATE POLICY "Authenticated users can view canned responses" 
  ON public.canned_responses FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Admins and creatives can manage canned responses
CREATE POLICY "Admins and creatives can manage canned responses" 
  ON public.canned_responses FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'creative')
    )
  );

-- Insert a default canned response
INSERT INTO public.canned_responses (shortcut, response_text)
VALUES 
  ('hello', 'Hello! Thanks for reaching out. How can we help you today?'),
  ('brb', 'I will be right back in a few minutes.'),
  ('review', 'Please review the latest deliverables in the files tab and let us know your thoughts.')
ON CONFLICT (shortcut) DO NOTHING;
