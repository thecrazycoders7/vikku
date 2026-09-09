-- pm_notifications: persistent in-app notifications with realtime delivery
CREATE TABLE IF NOT EXISTS pm_notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text NOT NULL, -- 'task_assigned' | 'task_overdue' | 'milestone_due' | 'client_approved' | 'client_rejected' | 'client_comment'
  message     text NOT NULL,
  sub_text    text,
  project_id  uuid REFERENCES pm_projects(id) ON DELETE CASCADE,
  entity_id   uuid,
  read        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pm_notifications ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can insert notifications (to notify others)
CREATE POLICY "insert_any_auth" ON pm_notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can only read/update/delete their own notifications
CREATE POLICY "own_select" ON pm_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "own_update" ON pm_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "own_delete" ON pm_notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS pm_notifications_user_unread
  ON pm_notifications(user_id, read, created_at DESC);
