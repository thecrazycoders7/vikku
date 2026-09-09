-- Fix: share_token column is uuid, but function params are text — cast needed
CREATE OR REPLACE FUNCTION verify_share_pin(p_token text, p_pin text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pm_projects
    WHERE share_token = p_token::uuid AND share_pin = p_pin
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix: same uuid cast issue in approve_task_client
CREATE OR REPLACE FUNCTION approve_task_client(
  p_task_id uuid, p_share_token text, p_status text, p_note text DEFAULT NULL
) RETURNS json AS $$
DECLARE v_result json;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pm_tasks t JOIN pm_projects p ON p.id = t.project_id
    WHERE t.id = p_task_id AND p.share_token = p_share_token::uuid
  ) THEN RAISE EXCEPTION 'Invalid share token'; END IF;
  UPDATE pm_tasks SET client_approval_status = p_status, client_approval_note = p_note WHERE id = p_task_id;
  SELECT row_to_json(t) INTO v_result FROM pm_tasks t WHERE t.id = p_task_id;
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION verify_share_pin(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION approve_task_client(uuid, text, text, text) TO anon, authenticated;
