-- Multiple assignees per task.
-- Adds an array column and backfills from the legacy single-assignee column.
-- The old assigned_to_email column is kept (app mirrors assigned_to_emails[0]
-- into it) for clean rollback and any un-migrated reader.

ALTER TABLE pm_tasks ADD COLUMN IF NOT EXISTS assigned_to_emails text[] DEFAULT '{}';

UPDATE pm_tasks SET assigned_to_emails = ARRAY[assigned_to_email]
  WHERE assigned_to_email IS NOT NULL
    AND (assigned_to_emails IS NULL OR assigned_to_emails = '{}');
