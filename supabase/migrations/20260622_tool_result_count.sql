-- Public count of generated tool results, for the social-proof counter.
-- The table itself is not anon-selectable, so expose only an aggregate count.
CREATE OR REPLACE FUNCTION tool_result_count(p_tool text DEFAULT NULL)
RETURNS bigint
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*) FROM tool_results WHERE p_tool IS NULL OR tool = p_tool;
$$;
GRANT EXECUTE ON FUNCTION tool_result_count(text) TO anon, authenticated;
