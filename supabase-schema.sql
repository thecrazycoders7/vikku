-- ============================================
-- Vikku PM - Supabase Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pm_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  client_name TEXT,
  client_email TEXT,
  color TEXT DEFAULT '#ffffff',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on-hold', 'completed', 'archived')),
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_pm_projects_user_id ON pm_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_pm_projects_share_token ON pm_projects(share_token);

-- ============================================
-- 2. TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pm_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_pm_tasks_project_id ON pm_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_pm_tasks_assigned_to ON pm_tasks(assigned_to);

-- ============================================
-- 3. MILESTONES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pm_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_pm_milestones_project_id ON pm_milestones(project_id);

-- ============================================
-- 4. PROJECT MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pm_project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_pm_project_members_project_id ON pm_project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_pm_project_members_user_id ON pm_project_members(user_id);

-- ============================================
-- 5. USER SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  razorpay_payment_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE pm_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROJECTS POLICIES
-- ============================================

-- Users can view their own projects
CREATE POLICY "Users can view own projects"
ON pm_projects
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own projects
CREATE POLICY "Users can create own projects"
ON pm_projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
ON pm_projects
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
ON pm_projects
FOR DELETE
USING (auth.uid() = user_id);

-- Anyone can view projects via share token (for client view)
CREATE POLICY "Anyone can view shared projects"
ON pm_projects
FOR SELECT
USING (share_token IS NOT NULL);

-- ============================================
-- TASKS POLICIES
-- ============================================

-- Users can view tasks of their projects
CREATE POLICY "Users can view tasks of own projects"
ON pm_tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pm_projects
    WHERE pm_projects.id = pm_tasks.project_id
    AND pm_projects.user_id = auth.uid()
  )
);

-- Users can create tasks in their projects
CREATE POLICY "Users can create tasks in own projects"
ON pm_tasks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pm_projects
    WHERE pm_projects.id = pm_tasks.project_id
    AND pm_projects.user_id = auth.uid()
  )
);

-- Users can update tasks in their projects
CREATE POLICY "Users can update tasks in own projects"
ON pm_tasks
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM pm_projects
    WHERE pm_projects.id = pm_tasks.project_id
    AND pm_projects.user_id = auth.uid()
  )
);

-- Users can delete tasks in their projects
CREATE POLICY "Users can delete tasks in own projects"
ON pm_tasks
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM pm_projects
    WHERE pm_projects.id = pm_tasks.project_id
    AND pm_projects.user_id = auth.uid()
  )
);

-- ============================================
-- MILESTONES POLICIES
-- ============================================

CREATE POLICY "Users can manage milestones in own projects"
ON pm_milestones
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM pm_projects
    WHERE pm_projects.id = pm_milestones.project_id
    AND pm_projects.user_id = auth.uid()
  )
);

-- ============================================
-- PROJECT MEMBERS POLICIES
-- ============================================

CREATE POLICY "Users can view members of own projects"
ON pm_project_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pm_projects
    WHERE pm_projects.id = pm_project_members.project_id
    AND pm_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add members to own projects"
ON pm_project_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pm_projects
    WHERE pm_projects.id = pm_project_members.project_id
    AND pm_projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove members from own projects"
ON pm_project_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM pm_projects
    WHERE pm_projects.id = pm_project_members.project_id
    AND pm_projects.user_id = auth.uid()
  )
);

-- ============================================
-- SUBSCRIPTIONS POLICIES
-- ============================================

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
ON user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own subscription
CREATE POLICY "Users can update own subscription"
ON user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can upsert own subscription"
ON user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_pm_projects_updated_at
  BEFORE UPDATE ON pm_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pm_tasks_updated_at
  BEFORE UPDATE ON pm_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pm_milestones_updated_at
  BEFORE UPDATE ON pm_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert sample data
-- INSERT INTO pm_projects (user_id, name, description, color, status)
-- VALUES (auth.uid(), 'Sample Project', 'This is a test project', '#93c5fd', 'active');

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM pm_projects;
-- SELECT * FROM pm_tasks;
-- SELECT * FROM pm_milestones;
-- SELECT * FROM pm_project_members;
-- SELECT * FROM user_subscriptions;

-- ============================================
-- DONE! 🎉
-- ============================================
-- Your database is now ready for the Vikku PM app
-- Make sure to add your Supabase credentials to .env:
-- VITE_SUPABASE_URL=your_project_url
-- VITE_SUPABASE_ANON_KEY=your_anon_key
-- ============================================
