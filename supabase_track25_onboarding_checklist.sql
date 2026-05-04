-- BrandingTN Track 25 — Client Onboarding Checklist Tracking Columns
-- Adds boolean flags to track onboarding milestones.
-- deposit_paid already exists on projects table.

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS brief_submitted BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS brand_guidelines_uploaded BOOLEAN DEFAULT false;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS kickoff_scheduled BOOLEAN DEFAULT false;
