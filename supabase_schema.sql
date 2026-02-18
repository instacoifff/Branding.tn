-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  company TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('client', 'admin', 'creative')) DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Team Members Table
CREATE TABLE public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Projects Table
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  services_selected JSONB DEFAULT '[]'::jsonb,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  deposit_paid BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('onboarding', 'active', 'completed')) DEFAULT 'onboarding',
  current_stage INTEGER CHECK (current_stage BETWEEN 1 AND 5) DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tasks Table
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'doing', 'done')) DEFAULT 'todo',
  assigned_to UUID REFERENCES public.team_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Files Table
CREATE TABLE public.files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  type TEXT CHECK (type IN ('concept', 'final')) NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin());

CREATE POLICY "Clients can view own projects" ON public.projects FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admins can view all projects" ON public.projects FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage projects" ON public.projects FOR ALL USING (is_admin());
CREATE POLICY "Clients can create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can view tasks for their projects" ON public.tasks FOR SELECT
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = tasks.project_id AND client_id = auth.uid()));
CREATE POLICY "Admins can manage tasks" ON public.tasks FOR ALL USING (is_admin());

CREATE POLICY "Clients can view files for their projects" ON public.files FOR SELECT
USING (EXISTS (SELECT 1 FROM public.projects WHERE id = files.project_id AND client_id = auth.uid()));
CREATE POLICY "Admins can manage files" ON public.files FOR ALL USING (is_admin());

CREATE POLICY "Public read team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL USING (is_admin());
