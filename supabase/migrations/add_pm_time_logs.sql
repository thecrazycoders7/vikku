-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS pm_time_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     uuid        REFERENCES pm_tasks(id) ON DELETE CASCADE NOT NULL,
  project_id  uuid        REFERENCES pm_projects(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  minutes     integer     NOT NULL CHECK (minutes > 0),
  note        text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE pm_time_logs ENABLE ROW LEVEL SECURITY;

-- Project owner can read all time logs for their projects
CREATE POLICY "Project owner can read time logs" ON pm_time_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pm_projects
      WHERE pm_projects.id = pm_time_logs.project_id
        AND pm_projects.user_id = auth.uid()
    )
  );

-- Any authenticated user can insert a time log (for team members logging time)
CREATE POLICY "Authenticated users can log time" ON pm_time_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own time logs
CREATE POLICY "Users can delete own time logs" ON pm_time_logs
  FOR DELETE USING (auth.uid() = user_id);
