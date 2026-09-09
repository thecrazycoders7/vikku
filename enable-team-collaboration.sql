-- ============================================
-- PRODUCTION: Enable Team Collaboration
-- ============================================
-- This enables multi-user collaboration on projects
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view tasks of own projects" ON pm_tasks;
DROP POLICY IF EXISTS "Users can create tasks in own projects" ON pm_tasks;
DROP POLICY IF EXISTS "Users can update tasks in own projects" ON pm_tasks;
DROP POLICY IF EXISTS "Users can delete tasks in own projects" ON pm_tasks;
DROP POLICY IF EXISTS "Users can manage milestones in own projects" ON pm_milestones;

-- ============================================
-- UPDATED POLICIES: Support Team Members
-- ============================================

-- TASKS: Team members can view/edit tasks
CREATE POLICY "Team members can view tasks"
ON pm_tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pm_projects p
    WHERE p.id = pm_tasks.project_id
    AND (
      p.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM pm_project_members m
        WHERE m.project_id = p.id
        AND m.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Team members can create tasks"
ON pm_tasks
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pm_projects p
    LEFT JOIN pm_project_members m ON m.project_id = p.id AND m.user_id = auth.uid()
    WHERE p.id = pm_tasks.project_id
    AND (
      p.user_id = auth.uid()
      OR (m.user_id = auth.uid() AND m.role IN ('admin', 'member'))
    )
  )
);

CREATE POLICY "Team members can update tasks"
ON pm_tasks
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM pm_projects p
    LEFT JOIN pm_project_members m ON m.project_id = p.id AND m.user_id = auth.uid()
    WHERE p.id = pm_tasks.project_id
    AND (
      p.user_id = auth.uid()
      OR (m.user_id = auth.uid() AND m.role IN ('admin', 'member'))
    )
  )
);

CREATE POLICY "Team members can delete tasks"
ON pm_tasks
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM pm_projects p
    LEFT JOIN pm_project_members m ON m.project_id = p.id AND m.user_id = auth.uid()
    WHERE p.id = pm_tasks.project_id
    AND (
      p.user_id = auth.uid()
      OR (m.user_id = auth.uid() AND m.role = 'admin')
    )
  )
);

-- MILESTONES: Team members can manage milestones
CREATE POLICY "Team members can manage milestones"
ON pm_milestones
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM pm_projects p
    LEFT JOIN pm_project_members m ON m.project_id = p.id AND m.user_id = auth.uid()
    WHERE p.id = pm_milestones.project_id
    AND (
      p.user_id = auth.uid()
      OR (m.user_id = auth.uid() AND m.role IN ('admin', 'member'))
    )
  )
);

-- PROJECTS: Team members can view shared projects
DROP POLICY IF EXISTS "Users can view own projects" ON pm_projects;

CREATE POLICY "Users can view own and shared projects"
ON pm_projects
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM pm_project_members
    WHERE pm_project_members.project_id = pm_projects.id
    AND pm_project_members.user_id = auth.uid()
  )
  OR share_token IS NOT NULL
);

-- ============================================
-- DONE! Team collaboration is now enabled
-- ============================================
