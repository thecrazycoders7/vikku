-- Allows any authenticated user to read the member limit for a project
-- without being blocked by RLS on user_subscriptions.
-- Run once in the Supabase SQL editor.

CREATE OR REPLACE FUNCTION get_project_member_limit(p_project_id uuid)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'plan',  COALESCE(us.plan, 'free'),
    'limit', CASE COALESCE(us.plan, 'free')
               WHEN 'pro'  THEN 10
               WHEN 'team' THEN 2147483647
               ELSE 3
             END
  )
  FROM pm_projects p
  LEFT JOIN user_subscriptions us ON us.user_id = p.user_id
  WHERE p.id = p_project_id;
$$;

GRANT EXECUTE ON FUNCTION get_project_member_limit(uuid) TO authenticated;
