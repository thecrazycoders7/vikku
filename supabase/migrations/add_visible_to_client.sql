-- Add visible_to_client flag to pm_task_attachments.
-- When true, the file is visible in the client portal for that project.

ALTER TABLE pm_task_attachments
ADD COLUMN IF NOT EXISTS visible_to_client boolean NOT NULL DEFAULT false;
