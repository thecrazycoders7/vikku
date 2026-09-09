-- ============================================
-- FIX: Infinite Recursion in RLS Policies
-- ============================================
-- This removes circular references in policies
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own projects" ON pm_projects;
DROP POLICY IF EXISTS "Users can view own and shared projects" ON pm_projects;
DROP POLICY IF EXISTS "Users can create own projects" ON pm_projects;
DROP POLICY IF EXISTS "Users can update own projects" ON pm_projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON pm_projects;
DROP POLICY IF EXISTS "Anyone can view shared projects" ON pm_projects;

-- STEP 2: Create SIMPLE policies without circular references

-- Policy 1: Users can INSERT their own projects
CREATE POLICY "enable_insert_own_projects"
ON pm_projects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can SELECT their own projects
CREATE POLICY "enable_select_own_projects"
ON pm_projects
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: Users can UPDATE their own projects
CREATE POLICY "enable_update_own_projects"
ON pm_projects
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can DELETE their own projects
CREATE POLICY "enable_delete_own_projects"
ON pm_projects
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy 5: Allow viewing via share token (no recursion)
CREATE POLICY "enable_select_shared_projects"
ON pm_projects
FOR SELECT
TO authenticated
USING (
  share_token IS NOT NULL
  AND share_token != ''
);

-- ============================================
-- DONE! No more infinite recursion
-- ============================================
-- The key is to NOT reference pm_project_members
-- in the pm_projects policies
-- ============================================
