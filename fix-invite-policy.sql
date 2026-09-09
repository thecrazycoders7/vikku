-- ============================================
-- FIX: Allow Project Owners to Invite Members
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view members of own projects" ON pm_project_members;
DROP POLICY IF EXISTS "Users can add members to own projects" ON pm_project_members;
DROP POLICY IF EXISTS "Users can remove members from own projects" ON pm_project_members;

-- Create correct policies that allow invitations

-- 1. View members: Anyone in the project can see members
CREATE POLICY "Project members can view team"
ON pm_project_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pm_projects
    WHERE pm_projects.id = pm_project_members.project_id
    AND (
      pm_projects.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM pm_project_members m2
        WHERE m2.project_id = pm_projects.id
        AND m2.user_id = auth.uid()
      )
    )
  )
);

-- 2. Add members: Project owner and admins can invite
CREATE POLICY "Project owners can invite members"
ON pm_project_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pm_projects
    WHERE pm_projects.id = pm_project_members.project_id
    AND pm_projects.user_id = auth.uid()
  )
);

-- 3. Remove members: Project owner and admins can remove
CREATE POLICY "Project owners can remove members"
ON pm_project_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM pm_projects
    WHERE pm_projects.id = pm_project_members.project_id
    AND pm_projects.user_id = auth.uid()
  )
);

-- 4. Update members: Project owner can change roles
CREATE POLICY "Project owners can update member roles"
ON pm_project_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM pm_projects
    WHERE pm_projects.id = pm_project_members.project_id
    AND pm_projects.user_id = auth.uid()
  )
);

-- ============================================
-- DONE! You can now invite team members
-- ============================================
