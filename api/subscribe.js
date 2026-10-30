import { createClient } from '@supabase/supabase-js'
import { SOURCES, checkSignup } from './_signup.js'

// Website sign-ups (footer newsletter and free-tool email capture). The browser can no longer write
// to `subscribers` directly (see supabase/migrations/20261101_subscribers_server_only.sql); this
// endpoint runs the bot checks first. The CRM trigger on `subscribers` then turns it into a lead.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, source, website, elapsedMs } = req.body || {}

  const check = checkSignup({ email, website, elapsedMs })
  if (check.silent) return res.status(200).json({ ok: true }) // bots get a normal-looking reply
  if (!check.ok) return res.status(400).json({ error: check.error })

  try {
    const supabase = createClient(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    const { error } = await supabase.from('subscribers').upsert(
      { email: check.email, source: SOURCES.includes(source) ? source : 'footer' },
      { onConflict: 'email', ignoreDuplicates: true },
    )
    if (error) throw error
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('subscribe error:', err)
    return res.status(500).json({ error: 'Could not save your email. Please try again.' })
  }
}
