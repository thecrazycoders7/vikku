-- Email notification preferences, one row per user. Missing row = all on
-- (opt-out model). Transactional emails (auth, billing receipts) are always
-- sent and are NOT gated by this table.

CREATE TABLE IF NOT EXISTS pm_email_prefs (
  user_id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tasks           boolean NOT NULL DEFAULT true,  -- assigned, status, comments
  mentions        boolean NOT NULL DEFAULT true,
  deadlines       boolean NOT NULL DEFAULT true,  -- due soon / overdue / reminders
  digests         boolean NOT NULL DEFAULT true,  -- daily / weekly summaries
  client_activity boolean NOT NULL DEFAULT true,  -- client comment / approval
  ai              boolean NOT NULL DEFAULT true,  -- AI planner / risk / summary
  product         boolean NOT NULL DEFAULT true,  -- product news / newsletter
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pm_email_prefs ENABLE ROW LEVEL SECURITY;

-- Users manage only their own preferences.
DROP POLICY IF EXISTS "own email prefs select" ON pm_email_prefs;
CREATE POLICY "own email prefs select" ON pm_email_prefs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own email prefs upsert" ON pm_email_prefs;
CREATE POLICY "own email prefs upsert" ON pm_email_prefs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "own email prefs update" ON pm_email_prefs;
CREATE POLICY "own email prefs update" ON pm_email_prefs
  FOR UPDATE USING (auth.uid() = user_id);

-- Helper the edge functions call (as service role) to decide whether to send.
-- Defaults to TRUE when the user has no row or the category is unknown.
CREATE OR REPLACE FUNCTION get_email_pref(p_email text, p_category text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_on boolean;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(p_email) LIMIT 1;
  IF v_user_id IS NULL THEN RETURN true; END IF;

  SELECT CASE p_category
    WHEN 'tasks'           THEN tasks
    WHEN 'mentions'        THEN mentions
    WHEN 'deadlines'       THEN deadlines
    WHEN 'digests'         THEN digests
    WHEN 'client_activity' THEN client_activity
    WHEN 'ai'              THEN ai
    WHEN 'product'         THEN product
    ELSE true
  END INTO v_on
  FROM pm_email_prefs WHERE user_id = v_user_id;

  RETURN COALESCE(v_on, true);
END;
$$;
