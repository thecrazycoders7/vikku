-- Hash share_pin at rest using pgcrypto bcrypt
-- Existing plaintext PINs are migrated to hashed form.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Migrate any existing plaintext PINs to hashed form.
-- Only rows where share_pin is set and does NOT already look like a bcrypt hash.
UPDATE pm_projects
SET share_pin = crypt(share_pin, gen_salt('bf', 8))
WHERE share_pin IS NOT NULL
  AND share_pin NOT LIKE '$2%';

-- Replace verify_share_pin to use constant-time bcrypt comparison.
CREATE OR REPLACE FUNCTION verify_share_pin(p_token text, p_pin text)
RETURNS boolean AS $$
DECLARE
  v_hash text;
BEGIN
  SELECT share_pin INTO v_hash
  FROM pm_projects
  WHERE share_token = p_token::uuid;

  IF v_hash IS NULL THEN
    RETURN TRUE; -- no PIN set → open access
  END IF;

  RETURN crypt(p_pin, v_hash) = v_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- New RPC: hash and store a PIN (or clear it) for a project the caller owns.
CREATE OR REPLACE FUNCTION set_share_pin(p_project_id uuid, p_pin text)
RETURNS void AS $$
BEGIN
  -- Ensure caller owns the project
  IF NOT EXISTS (
    SELECT 1 FROM pm_projects WHERE id = p_project_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_pin IS NULL OR p_pin = '' THEN
    UPDATE pm_projects SET share_pin = NULL WHERE id = p_project_id;
  ELSE
    UPDATE pm_projects
    SET share_pin = crypt(p_pin, gen_salt('bf', 8))
    WHERE id = p_project_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION verify_share_pin(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION set_share_pin(uuid, text) TO authenticated;
