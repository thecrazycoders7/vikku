import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { calBooking } from './_crm.js'

// Cal.com webhook -> CRM. Bookings become crm_meetings (matched on Cal's uid), linked to the client or
// lead with the attendee's email; an unknown booker becomes a new lead (source "Cal.com booking").
// Set up in Cal.com: Settings -> Developer -> Webhooks, URL https://www.vikku.in/api/cal-webhook,
// events Booking created / rescheduled / cancelled, and a secret that matches CAL_WEBHOOK_SECRET in Vercel.

export const config = { api: { bodyParser: false } }

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// The signature covers the exact bytes Cal sent, so read the raw body rather than a re-serialised object.
async function rawBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw || (req.body ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : '')
}

function validSignature(raw, header, secret) {
  if (!header) return false
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')
  const a = Buffer.from(expected), b = Buffer.from(String(header))
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

const must = ({ data, error }) => { if (error) throw error; return data }

// Existing client, else existing lead, else a new lead from the booking.
async function findOrCreatePerson(person) {
  if (person.email) {
    // Case-insensitive exact match: escape LIKE wildcards ("_" is common in emails).
    const pattern = person.email.replace(/[\\%_]/g, (c) => '\\' + c)
    const clients = must(await supabase.from('crm_clients').select('id').ilike('email', pattern).limit(1))
    if (clients.length) return { client_id: clients[0].id, lead_id: null }
    const leads = must(await supabase.from('crm_leads').select('id, client_id').ilike('email', pattern).order('created_at', { ascending: false }).limit(1))
    if (leads.length) return { lead_id: leads[0].id, client_id: leads[0].client_id || null }
  }
  const lead = must(await supabase.from('crm_leads').insert({
    name: person.name, email: person.email, phone: person.phone, notes: person.notes, source: 'cal_booking', stage: 'new',
  }).select('id').single())
  return { lead_id: lead.id, client_id: null }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const secret = process.env.CAL_WEBHOOK_SECRET
  if (!secret) return res.status(500).json({ error: 'Webhook secret not configured' })

  const raw = await rawBody(req)
  if (!validSignature(raw, req.headers['x-cal-signature-256'], secret)) return res.status(401).json({ error: 'Invalid signature' })

  let booking
  try { booking = calBooking(JSON.parse(raw)) }
  catch { return res.status(400).json({ error: 'Invalid JSON' }) }
  if (!booking) return res.status(200).json({ ok: true, ignored: true })

  try {
    if (booking.event === 'BOOKING_CANCELLED') {
      must(await supabase.from('crm_meetings').update({ status: 'cancelled' }).eq('cal_uid', booking.uid))
      return res.status(200).json({ ok: true, cancelled: booking.uid })
    }
    if (booking.previousUid) {
      must(await supabase.from('crm_meetings').update({ status: 'cancelled', outcome: 'Rescheduled' }).eq('cal_uid', booking.previousUid))
    }
    const links = await findOrCreatePerson(booking.person)
    must(await supabase.from('crm_meetings').upsert(
      { ...booking.meeting, ...links, cal_uid: booking.uid, source: 'cal', status: 'scheduled' },
      { onConflict: 'cal_uid' },
    ))
    return res.status(200).json({ ok: true, uid: booking.uid })
  } catch (err) {
    console.error('cal-webhook error:', err)
    return res.status(500).json({ error: 'Could not save booking' })
  }
}
