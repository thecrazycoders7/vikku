-- SECURITY FIX: tool_results was publicly readable (USING true), exposing every
-- saved result AND captured email to anyone with the public anon key. Lock it down:
--  • remove blanket public SELECT
--  • serve share pages via a SECURITY DEFINER function that takes the share_id
--    and never returns the email column
--  • keep anonymous inserts working (tool users aren't logged in) but they can
--    no longer read the table back

DROP POLICY IF EXISTS "public read tool results" ON tool_results;

-- Read a single result by its unguessable share_id, without leaking email/user_id.
CREATE OR REPLACE FUNCTION get_tool_result(p_share_id text)
RETURNS TABLE (tool text, title text, result jsonb, created_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tool, title, result, created_at
  FROM tool_results
  WHERE share_id = p_share_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_tool_result(text) TO anon, authenticated;

-- Logged-in users may still list their own saved results (used by the dashboard).
DO $$ BEGIN
  CREATE POLICY "users read own tool results"
    ON tool_results FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
