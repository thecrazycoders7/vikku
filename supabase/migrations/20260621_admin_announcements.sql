CREATE TABLE IF NOT EXISTS admin_announcements (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text        NOT NULL,
  body       text        NOT NULL,
  target     text        NOT NULL DEFAULT 'all',
  active     boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);
ALTER TABLE admin_announcements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "public read active announcements"
    ON admin_announcements FOR SELECT
    USING (active = true AND (expires_at IS NULL OR expires_at > now()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
