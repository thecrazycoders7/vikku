-- Server-side AI planner usage tracking (free tier = 6 / calendar month).
-- Enforced by the openai-plan edge function with the service-role key.
-- Clients may read their own usage but never write it.

CREATE TABLE IF NOT EXISTS ai_plan_usage (
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period     text NOT NULL,                 -- 'YYYY-MM'
  count      integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, period)
);

ALTER TABLE ai_plan_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read own ai usage" ON ai_plan_usage;
CREATE POLICY "read own ai usage"
  ON ai_plan_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- No client write policies — only the service role (edge function) writes.
