-- Custom Workflows
CREATE TABLE IF NOT EXISTS pm_workflows (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pm_workflow_stages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES pm_workflows(id) ON DELETE CASCADE,
  name        text NOT NULL,
  color       text NOT NULL DEFAULT '#6b7280',
  position    integer NOT NULL DEFAULT 0,
  is_done     boolean NOT NULL DEFAULT false,
  status_key  text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workflow_id, status_key)
);

CREATE INDEX IF NOT EXISTS idx_wf_stages_wf_pos ON pm_workflow_stages(workflow_id, position);
ALTER TABLE pm_projects ADD COLUMN IF NOT EXISTS workflow_id uuid REFERENCES pm_workflows(id) ON DELETE SET NULL;

ALTER TABLE pm_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_workflow_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own workflows" ON pm_workflows
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Workflow owner manages stages" ON pm_workflow_stages
  FOR ALL USING (EXISTS (SELECT 1 FROM pm_workflows WHERE id = workflow_id AND user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM pm_workflows WHERE id = workflow_id AND user_id = auth.uid()));

CREATE POLICY "Project members read workflow stages" ON pm_workflow_stages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pm_projects p
      LEFT JOIN pm_project_members m ON m.project_id = p.id AND m.user_id = auth.uid()
      WHERE p.workflow_id = pm_workflow_stages.workflow_id
        AND (p.user_id = auth.uid() OR m.user_id IS NOT NULL)
    )
  );

-- Extended time tracking
ALTER TABLE pm_time_logs ADD COLUMN IF NOT EXISTS billable    boolean     NOT NULL DEFAULT true;
ALTER TABLE pm_time_logs ADD COLUMN IF NOT EXISTS start_time  timestamptz;
ALTER TABLE pm_time_logs ADD COLUMN IF NOT EXISTS end_time    timestamptz;
ALTER TABLE pm_time_logs ADD COLUMN IF NOT EXISTS is_running  boolean     NOT NULL DEFAULT false;
ALTER TABLE pm_time_logs ADD COLUMN IF NOT EXISTS user_email  text;
CREATE INDEX IF NOT EXISTS idx_time_logs_running ON pm_time_logs(user_id, is_running) WHERE is_running = true;

-- Estimated minutes per task
ALTER TABLE pm_tasks ADD COLUMN IF NOT EXISTS estimated_minutes integer;
