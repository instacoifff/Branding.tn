-- 1. Drop existing foreign key constraints on the `assigned_to` column in `tasks`
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;

-- 2. Clear out any old legacy UUIDs from team_members that will no longer map correctly to profiles
UPDATE public.tasks SET assigned_to = NULL;

-- 3. Add the new foreign key pointing to public.profiles
ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. Drop the team_members table entirely
DROP TABLE IF EXISTS public.team_members CASCADE;
