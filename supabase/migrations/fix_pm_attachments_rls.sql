-- Fix pm_task_attachments RLS so all project members can read attachments,
-- not just the uploader.

-- Drop old policies (names may vary — drop all variants)
DROP POLICY IF EXISTS "Users can view own attachments" ON pm_task_attachments;
DROP POLICY IF EXISTS "Users can see own attachments" ON pm_task_attachments;
DROP POLICY IF EXISTS "Users can upload attachments" ON pm_task_attachments;
DROP POLICY IF EXISTS "Users can insert attachments" ON pm_task_attachments;
DROP POLICY IF EXISTS "Users can delete own attachments" ON pm_task_attachments;
DROP POLICY IF EXISTS "Users can update own attachments" ON pm_task_attachments;

-- SELECT: project owner OR any project member can read attachments on tasks in their project
CREATE POLICY "Project members can read attachments"
ON pm_task_attachments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pm_tasks t
    JOIN pm_projects p ON p.id = t.project_id
    WHERE t.id = pm_task_attachments.task_id
    AND (
      p.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM pm_project_members m
        WHERE m.project_id = p.id
        AND m.user_id = auth.uid()
      )
    )
  )
);

-- INSERT: authenticated user who is a project member or owner
CREATE POLICY "Project members can upload attachments"
ON pm_task_attachments FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM pm_tasks t
    JOIN pm_projects p ON p.id = t.project_id
    WHERE t.id = pm_task_attachments.task_id
    AND (
      p.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM pm_project_members m
        WHERE m.project_id = p.id
        AND m.user_id = auth.uid()
      )
    )
  )
);

-- UPDATE: uploader only (for visible_to_client toggle)
CREATE POLICY "Users can update own attachments"
ON pm_task_attachments FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE: uploader only
CREATE POLICY "Users can delete own attachments"
ON pm_task_attachments FOR DELETE
USING (auth.uid() = user_id);
