-- Task dependencies
CREATE TABLE IF NOT EXISTS pm_task_dependencies (
  task_id          uuid REFERENCES pm_tasks(id) ON DELETE CASCADE NOT NULL,
  depends_on_task_id uuid REFERENCES pm_tasks(id) ON DELETE CASCADE NOT NULL,
  project_id       uuid REFERENCES pm_projects(id) ON DELETE CASCADE NOT NULL,
  created_at       timestamptz DEFAULT now(),
  PRIMARY KEY (task_id, depends_on_task_id)
);
ALTER TABLE pm_task_dependencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members can manage dependencies" ON pm_task_dependencies FOR ALL USING (
  EXISTS (SELECT 1 FROM pm_projects p WHERE p.id = project_id AND p.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM pm_project_members m WHERE m.project_id = project_id AND m.user_id = auth.uid())
);

-- Recurring tasks
ALTER TABLE pm_tasks ADD COLUMN IF NOT EXISTS recurrence text; -- 'daily' | 'weekly' | 'monthly'

-- Share PIN (hashed comparison done server-side via RPC)
ALTER TABLE pm_projects ADD COLUMN IF NOT EXISTS share_pin text;

-- Client approval on tasks
ALTER TABLE pm_tasks ADD COLUMN IF NOT EXISTS client_approval_status text; -- 'approved' | 'needs_revision'
ALTER TABLE pm_tasks ADD COLUMN IF NOT EXISTS client_approval_note text;

-- RPC: verify share PIN (strips actual PIN from client response)
CREATE OR REPLACE FUNCTION verify_share_pin(p_token text, p_pin text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM pm_projects WHERE share_token = p_token AND share_pin = p_pin);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: client task approval (bypasses task RLS, verifies share token)
CREATE OR REPLACE FUNCTION approve_task_client(
  p_task_id uuid, p_share_token text, p_status text, p_note text DEFAULT NULL
) RETURNS json AS $$
DECLARE v_result json;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pm_tasks t JOIN pm_projects p ON p.id = t.project_id
    WHERE t.id = p_task_id AND p.share_token = p_share_token
  ) THEN RAISE EXCEPTION 'Invalid share token'; END IF;
  UPDATE pm_tasks SET client_approval_status = p_status, client_approval_note = p_note WHERE id = p_task_id;
  SELECT row_to_json(t) INTO v_result FROM pm_tasks t WHERE t.id = p_task_id;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
