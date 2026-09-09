-- Rate limit table for share-token-based notifications (10 per hour per token)
CREATE TABLE IF NOT EXISTS notification_rate_limits (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  share_token text NOT NULL,
  created_at  timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_nrl_token_time ON notification_rate_limits (share_token, created_at);

-- Auto-purge rows older than 2 hours to keep the table small
CREATE OR REPLACE FUNCTION purge_old_rate_limits() RETURNS void LANGUAGE sql AS $$
  DELETE FROM notification_rate_limits WHERE created_at < now() - interval '2 hours';
$$;
