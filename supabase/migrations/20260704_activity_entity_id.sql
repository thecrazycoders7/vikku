-- Support a per-task activity feed (like Trello's card activity log).
-- entity_id lets us filter pm_activity down to one task's history; detail
-- carries a free-text description for field-level edits (e.g. "changed
-- priority to High") that don't fit the fixed action enum.
ALTER TABLE pm_activity ADD COLUMN IF NOT EXISTS entity_id uuid;
ALTER TABLE pm_activity ADD COLUMN IF NOT EXISTS detail text;
CREATE INDEX IF NOT EXISTS pm_activity_entity_id_idx ON pm_activity(entity_id);
