-- Per-project custom label list stored as jsonb array of {name, color}
ALTER TABLE pm_projects ADD COLUMN IF NOT EXISTS labels jsonb NOT NULL DEFAULT '[]';
