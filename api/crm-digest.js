import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { buildDigest, istToday } from './_crm.js'

// Daily CRM email (Vercel cron, see vercel.json): today's meetings, follow-ups due, overdue payments and
// retainers to bill this week. Sent only when something needs attention; add ?force=1 to send anyway.
// Vercel calls it with "Authorization: Bearer $CRON_SECRET"; set CRON_SECRET in the Vercel project.
// Recipient: CRM_DIGEST_TO (comma-separated), default connect@vikku.in.

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)
const must = ({ data, error }) => { if (error) throw error; return data }

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const today = istToday()
    const dayStart = new Date(`${today}T00:00:00+05:30`).toISOString()
    const dayEnd = new Date(`${today}T23:59:59.999+05:30`).toISOString()
    const [leads, payments, retainers, meetings, clients] = await Promise.all([
      supabase.from('crm_leads').select('name, company, stage, next_follow_up').not('next_follow_up', 'is', null).lte('next_follow_up', today).not('stage', 'in', '(won,lost)'),
      supabase.from('crm_payments').select('client_id, amount, currency, status, due_on').eq('status', 'pending').lt('due_on', today),
      supabase.from('crm_retainers').select('client_id, title, amount, currency, status, next_billing_date').eq('status', 'active'),
      supabase.from('crm_meetings').select('title, attendee_name, starts_at, status').gte('starts_at', dayStart).lte('starts_at', dayEnd),
      supabase.from('crm_clients').select('id, name'),
    ].map(p => p.then(must)))

    const digest = buildDigest({ leads, payments, retainers, meetings, clients }, today)
    const force = req.query?.force === '1'
    if (!digest.count && !force) return res.status(200).json({ ok: true, sent: false, today })

    const to = (process.env.CRM_DIGEST_TO || 'connect@vikku.in').split(',').map(s => s.trim()).filter(Boolean)
    const { error } = await resend.emails.send({ from: 'Vikku CRM <noreply@vikku.in>', to, subject: digest.subject, html: digest.html, text: digest.text })
    if (error) throw error
    return res.status(200).json({ ok: true, sent: true, items: digest.count, today })
  } catch (err) {
    console.error('crm-digest error:', err)
    return res.status(500).json({ error: 'Digest failed' })
  }
}
