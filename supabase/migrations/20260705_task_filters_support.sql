-- Support for the task filter panel: sortable "updated_at" and saved
-- per-user filter presets.

ALTER TABLE pm_tasks ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION pm_tasks_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pm_tasks_updated_at ON pm_tasks;
CREATE TRIGGER pm_tasks_updated_at
  BEFORE UPDATE ON pm_tasks
  FOR EACH ROW EXECUTE FUNCTION pm_tasks_set_updated_at();

CREATE TABLE IF NOT EXISTS pm_filter_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES pm_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pm_filter_presets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own filter presets" ON pm_filter_presets;
CREATE POLICY "Users manage own filter presets" ON pm_filter_presets
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
