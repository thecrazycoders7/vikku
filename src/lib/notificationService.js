import { supabase } from './supabaseClient'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

async function callEdge(type, body, useAuth = true) {
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (useAuth) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
    }
    await fetch(`${SUPABASE_URL}/functions/v1/send-notification`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ type, ...body }),
    })
  } catch {
    // Notifications are best-effort - never block the UI
  }
}

export function notifyTaskAssigned({ taskTitle, projectName, assigneeEmail, dueDate }) {
  if (!assigneeEmail) return
  callEdge('task_assigned', { taskTitle, projectName, assigneeEmail, dueDate })
}

export function notifyClientComment({ shareToken, authorName, comment }) {
  callEdge('client_comment', { shareToken, authorName, comment }, false)
}

export function notifyClientApproval({ shareToken, taskTitle, status, note }) {
  callEdge('client_approval', { shareToken, taskTitle, status, note }, false)
}

export function notifyMilestoneApproval({ shareToken, milestoneTitle, status, note }) {
  callEdge('milestone_approval', { shareToken, milestoneTitle, status, note }, false)
}

// ── In-app notifications (pm_notifications table) ──────────────────────────

/**
 * Insert an in-app notification for a specific user.
 * Any authenticated user can call this (to notify a team member).
 */
export async function insertPmNotification({ userId, type, message, subText, projectId, entityId }) {
  if (!supabase || !userId) return
  try {
    await supabase.from('pm_notifications').insert({
      user_id: userId,
      type,
      message,
      sub_text: subText || null,
      project_id: projectId || null,
      entity_id: entityId || null,
    })
  } catch {
    // Best-effort
  }
}

/** Resolve a member's user_id from their email + project_id. */
export async function getMemberUserId(projectId, email) {
  if (!supabase || !projectId || !email) return null
  try {
    const { data } = await supabase
      .from('pm_project_members')
      .select('user_id')
      .eq('project_id', projectId)
      .eq('email', email)
      .maybeSingle()
    return data?.user_id || null
  } catch {
    return null
  }
}

export async function markPmNotificationRead(id) {
  if (!supabase) return
  await supabase.from('pm_notifications').update({ read: true }).eq('id', id)
}

export async function markAllPmNotificationsRead(userId) {
  if (!supabase || !userId) return
  await supabase.from('pm_notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
}

export async function fetchPmNotifications(userId, limit = 30) {
  if (!supabase || !userId) return []
  try {
    const { data } = await supabase
      .from('pm_notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(limit)
    return data || []
  } catch {
    return []
  }
}
