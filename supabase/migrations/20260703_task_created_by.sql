-- Track who created a task so the UI can show "added by X" on the card.
-- Mirrors the assigned_to_email pattern already used for assignees.
ALTER TABLE pm_tasks ADD COLUMN IF NOT EXISTS created_by_email text;
