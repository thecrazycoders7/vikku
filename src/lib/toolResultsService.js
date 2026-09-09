import { supabase } from './supabaseClient'

// Short, URL-friendly, unguessable id for shareable links.
function makeShareId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let s = ''
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

export const TOOL_LABELS = {
  cost_estimator:        'Cost Estimate',
  roi_calculator:        'ROI Report',
  timeline_calculator:   'Project Timeline',
  tech_recommender:      'Tech Stack',
  maintenance_calculator:'Maintenance Estimate',
  ai_visibility_score:   'AI Visibility Score',
}

/**
 * Persist a tool result. Returns { shareId } so the caller can build a share link.
 * Works for anonymous users too (user_id is null).
 */
export async function saveToolResult({ tool, title, input, result, email = null }) {
  if (!supabase) return { shareId: null }
  const shareId = makeShareId()
  let userId = null
  try {
    const { data } = await supabase.auth.getUser()
    userId = data?.user?.id ?? null
  } catch { /* anonymous */ }

  const { error } = await supabase.from('tool_results').insert({
    share_id: shareId,
    tool,
    title: title || TOOL_LABELS[tool] || 'Result',
    input,
    result,
    user_id: userId,
    email,
  })
  if (error) {
    console.error('saveToolResult failed:', error)
    return { shareId: null }
  }
  return { shareId }
}

export async function getToolResultByShareId(shareId) {
  if (!supabase) return null
  // Reads through a SECURITY DEFINER function - the table is no longer publicly
  // selectable, so emails/PII can't be dumped via the anon key.
  const { data, error } = await supabase
    .rpc('get_tool_result', { p_share_id: shareId })
  if (error) { console.error('getToolResultByShareId failed:', error); return null }
  return Array.isArray(data) ? (data[0] || null) : data
}

export async function getToolResultCount(tool = null) {
  if (!supabase) return 0
  const { data, error } = await supabase.rpc('tool_result_count', { p_tool: tool })
  if (error) { console.error('getToolResultCount failed:', error); return 0 }
  return Number(data) || 0
}

export async function getMyToolResults(userId) {
  if (!supabase || !userId) return []
  const { data, error } = await supabase
    .from('tool_results')
    .select('id, share_id, tool, title, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) { console.error('getMyToolResults failed:', error); return [] }
  return data || []
}

/** Email a saved result to the user (sends an HTML summary + link to the share page). */
export async function emailToolResult({ shareId, email, tool, title }) {
  const res = await fetch('/api/send-tool-result', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shareId, email, tool, title }),
  })
  if (!res.ok) {
    const d = await res.json().catch(() => ({}))
    throw new Error(d.error || 'Failed to send email')
  }
  return res.json()
}
