-- Saved results for the free tools (cost estimator, ROI, timeline, tech stack).
-- Enables: save-for-logged-in-users, shareable public links, and emailing results.
CREATE TABLE IF NOT EXISTS tool_results (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id   text        NOT NULL UNIQUE,
  tool       text        NOT NULL,                 -- 'cost_estimator' | 'roi_calculator' | 'timeline_calculator' | 'tech_recommender'
  title      text,
  user_id    uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  email      text,
  input      jsonb       NOT NULL DEFAULT '{}'::jsonb,
  result     jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tool_results_user_idx  ON tool_results (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS tool_results_share_idx ON tool_results (share_id);

ALTER TABLE tool_results ENABLE ROW LEVEL SECURITY;

-- Anyone can read a result (the share_id is the unguessable key — used by /r/:shareId)
DO $$ BEGIN
  CREATE POLICY "public read tool results"
    ON tool_results FOR SELECT
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Anyone (including anonymous tool users) can insert a result
DO $$ BEGIN
  CREATE POLICY "anyone can insert tool results"
    ON tool_results FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Logged-in users can delete their own saved results
DO $$ BEGIN
  CREATE POLICY "users delete own tool results"
    ON tool_results FOR DELETE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
