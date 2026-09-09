-- Fix: deleted tasks reappearing after refresh.
--
-- The DELETE policy on pm_tasks only allowed the project owner or members
-- with role 'admin', while INSERT/UPDATE also allow role 'member'. When a
-- 'member' deleted a task, RLS silently filtered the delete (0 rows, no
-- error), the UI removed the card, and the task came back on refresh.
--
-- Align DELETE with INSERT/UPDATE: owner, admin, and member may delete.

DROP POLICY IF EXISTS "Team members can delete tasks" ON pm_tasks;

CREATE POLICY "Team members can delete tasks"
ON pm_tasks
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM pm_projects p
    LEFT JOIN pm_project_members m ON m.project_id = p.id AND m.user_id = auth.uid()
    WHERE p.id = pm_tasks.project_id
    AND (
      p.user_id = auth.uid()
      OR (m.user_id = auth.uid() AND m.role IN ('admin', 'member'))
    )
  )
);
