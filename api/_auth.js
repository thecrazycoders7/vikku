import { createClient } from '@supabase/supabase-js'

// Shared by endpoints that need the signed-in user. Only the service role is required, so a missing
// SUPABASE_ANON_KEY can't stop payments from being confirmed. Tested by _auth.test.mjs.
export function adminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
}

// Supabase checks the login token here; never take a user id from the request body.
export async function callerOf(req, admin) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return null
  const { data, error } = await admin.auth.getUser(token)
  return error ? null : data?.user || null
}
