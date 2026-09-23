import { supabase } from './supabaseClient'

// Email preference categories shown on the settings page. Keys match the
// pm_email_prefs columns and the get_email_pref() category strings.
export const PREF_CATEGORIES = [
  { key: 'tasks',           label: 'Task activity',      desc: 'Assignments, status changes, and comments on your tasks' },
  { key: 'mentions',        label: 'Mentions',           desc: 'When someone @mentions you in a task or comment' },
  { key: 'deadlines',       label: 'Deadlines & reminders', desc: 'Tasks due soon, overdue, and milestone reminders' },
  { key: 'digests',         label: 'Digests & summaries', desc: 'Daily and weekly project summaries' },
  { key: 'client_activity', label: 'Client activity',    desc: 'Client comments, approvals, and change requests' },
  { key: 'ai',              label: 'AI insights',        desc: 'AI plans, risk alerts, and project health reports' },
  { key: 'product',         label: 'Product & tips',     desc: 'Occasional product news and growth tips (never spam)' },
]

const DEFAULTS = Object.fromEntries(PREF_CATEGORIES.map((c) => [c.key, true]))

export async function getEmailPrefs(userId) {
  if (!userId) return { ...DEFAULTS }
  const { data } = await supabase.from('pm_email_prefs').select('*').eq('user_id', userId).maybeSingle()
  if (!data) return { ...DEFAULTS }
  return { ...DEFAULTS, ...data }
}

export async function saveEmailPrefs(userId, prefs) {
  const row = { user_id: userId, updated_at: new Date().toISOString() }
  for (const c of PREF_CATEGORIES) row[c.key] = !!prefs[c.key]
  const { error } = await supabase.from('pm_email_prefs').upsert(row, { onConflict: 'user_id' })
  if (error) throw error
}
