-- ============================================================================
-- Fix: creating a Vikku PM project failed with
--   "new row violates row-level security policy for table pm_projects".
--
-- The app saves a project and reads it back in one request (insert ... returning).
-- The read rule only used pm_can_access_project(id), which looks the project up
-- by id, and inside that same statement it can't see the row being created, so
-- every new project was rejected (PM "New project" and the CRM "Create PM board").
-- Owners now match on the row's own user_id first. Who can read what is unchanged:
-- the owner, or an invited member.
--
-- Safe to run more than once. Run in the Supabase SQL editor.
-- ============================================================================

drop policy if exists pm_projects_select on pm_projects;
create policy pm_projects_select on pm_projects for select
  using (user_id = auth.uid() or pm_can_access_project(id));

notify pgrst, 'reload schema';
