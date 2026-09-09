ALTER TABLE pm_tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_pm_tasks_completed_at ON pm_tasks (completed_at)
  WHERE completed_at IS NOT NULL;
