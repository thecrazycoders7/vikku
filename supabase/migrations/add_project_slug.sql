-- Add slug column to pm_projects for clean URLs.
-- Slug format: {sanitized-name}-{first-4-chars-of-uuid}
-- e.g. "My Awesome Project" + id starting with "a3f2..." → "my-awesome-project-a3f2"

ALTER TABLE pm_projects ADD COLUMN IF NOT EXISTS slug text;

-- Generate slugs for existing projects
UPDATE pm_projects
SET slug = COALESCE(
  NULLIF(
    TRIM('-' FROM lower(regexp_replace(left(name, 46), '[^a-zA-Z0-9]+', '-', 'g'))),
    ''
  ),
  'project'
) || '-' || left(id::text, 4)
WHERE slug IS NULL;

-- Enforce uniqueness and not-null going forward
ALTER TABLE pm_projects ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS pm_projects_slug_idx ON pm_projects(slug);
