-- Rate limiting for the public AI tool endpoints (cost/roi/timeline/stack).
-- These are callable with the public anon key, so without a ceiling an attacker
-- can run unbounded gpt-4o calls and run up the OpenAI bill.

CREATE TABLE IF NOT EXISTS ai_rate_limits (
  bucket     text        PRIMARY KEY,
  count      int         NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL
);

ALTER TABLE ai_rate_limits ENABLE ROW LEVEL SECURITY;  -- only service_role touches it

-- Atomic increment-and-check. Returns TRUE if the call is allowed, FALSE if the
-- bucket is over its limit for the current fixed window.
CREATE OR REPLACE FUNCTION ai_rate_hit(p_key text, p_max int, p_window_seconds int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  DELETE FROM ai_rate_limits WHERE expires_at < now();
  INSERT INTO ai_rate_limits (bucket, count, expires_at)
    VALUES (p_key, 1, now() + make_interval(secs => p_window_seconds))
  ON CONFLICT (bucket)
    DO UPDATE SET count = ai_rate_limits.count + 1
  RETURNING count INTO v_count;
  RETURN v_count <= p_max;
END;
$$;
