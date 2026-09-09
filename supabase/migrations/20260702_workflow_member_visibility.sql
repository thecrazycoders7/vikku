-- Fix: members never see the owner's custom workflow.
--
-- pm_workflows only had "Users manage own workflows" (user_id = auth.uid()).
-- Members could read pm_workflow_stages (policy added in
-- custom_workflows_time_tracking.sql) but not the parent pm_workflows row,
-- so getWorkflow() returned null for them and the UI silently fell back to
-- the default stages - even after a refresh.
--
-- Mirror the stages policy: anyone in a project that uses the workflow can
-- read it. Management (insert/update/delete) stays owner-only via the
-- existing FOR ALL policy.

CREATE POLICY "Project members read workflows" ON pm_workflows
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pm_projects p
      LEFT JOIN pm_project_members m ON m.project_id = p.id AND m.user_id = auth.uid()
      WHERE p.workflow_id = pm_workflows.id
        AND (p.user_id = auth.uid() OR m.user_id IS NOT NULL)
    )
  );

-- Let open sessions receive pm_projects updates (workflow assignment,
-- renames, labels) over realtime. Guarded: adding a table twice errors.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE pm_projects;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
