import { supabase } from './supabaseClient'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data?.session?.access_token || ''
}

function baseHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  }
}

async function adminFetch(type) {
  const token = await getToken()
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-stats?type=${type}`, {
    headers: baseHeaders(token),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `admin-stats failed (${res.status})`)
  }
  return res.json()
}

export const getAdminOverview = () => adminFetch('overview')
export const getAdminUsers    = () => adminFetch('users')
export const getAdminBilling  = () => adminFetch('billing')

async function adminPost(body) {
  const token = await getToken()
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-stats`, {
    method: 'POST',
    headers: baseHeaders(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Admin action failed')
  }
  return res.json()
}

export const adminChangePlan         = (userId, plan) => adminPost({ action: 'change_plan', userId, plan })
export const getAdminAnalytics       = () => adminFetch('analytics')
export const getAdminAnnouncements   = () => adminFetch('announcements')
export const getAdminUserDetail      = (userId) => adminFetch(`user_detail&userId=${userId}`)
export const adminCreateAnnouncement = (data) => adminPost({ action: 'create_announcement', ...data })
export const adminToggleAnnouncement = (id, active) => adminPost({ action: 'toggle_announcement', id, active })
export const adminDeleteAnnouncement = (id) => adminPost({ action: 'delete_announcement', id })
export const adminDeleteUser         = (userId) => adminPost({ action: 'delete_user', userId })
export const adminSendEmail          = (data)   => adminPost({ action: 'send_email', ...data })
export const getAdminActivity        = ()        => adminFetch('activity')
export const getAdminMrrHistory      = ()        => adminFetch('mrr_history')
export const getAdminUserGrowth      = ()        => adminFetch('user_growth')
export const getAdminExpiring        = ()        => adminFetch('expiring')
