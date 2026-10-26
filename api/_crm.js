// Pure helpers for the CRM API functions (Cal.com webhook, daily digest). Files starting with "_"
// are not deployed as endpoints by Vercel. Tested by api/_crm.test.mjs.

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const answer = (responses, key) => {
  const v = responses?.[key]
  return typeof v === 'object' && v !== null ? v.value : v
}

// Cal.com webhook body -> what to store. Returns null for events we ignore (PING, meeting ended, ...).
export function calBooking(body) {
  const event = body?.triggerEvent
  const p = body?.payload
  if (!p?.uid || !['BOOKING_CREATED', 'BOOKING_RESCHEDULED', 'BOOKING_CANCELLED'].includes(event)) return null
  const attendee = p.attendees?.[0] || {}
  const email = (attendee.email || answer(p.responses, 'email') || '').trim().toLowerCase() || null
  const name = (attendee.name || answer(p.responses, 'name') || '').trim() || email || 'Cal.com booking'
  const notes = answer(p.responses, 'notes') || p.additionalNotes || null
  const phone = answer(p.responses, 'attendeePhoneNumber') || answer(p.responses, 'phone') || null
  const location = p.metadata?.videoCallUrl || (typeof p.location === 'string' && /^https?:\/\//.test(p.location) ? p.location : null)
  return {
    event,
    uid: p.uid,
    previousUid: event === 'BOOKING_RESCHEDULED' ? (p.rescheduleUid || p.fromReschedule || null) : null,
    person: { name, email, phone, notes },
    meeting: {
      title: p.title || p.eventTitle || 'Cal.com meeting',
      starts_at: p.startTime,
      ends_at: p.endTime || null,
      location,
      attendee_name: name,
      attendee_email: email,
      notes,
    },
  }
}

const money = (n, cur) => (cur === 'USD' ? '$' : '₹') + Number(n || 0).toLocaleString(cur === 'USD' ? 'en-US' : 'en-IN')
const day = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', timeZone: 'UTC' })
const time = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })

// Today's date in India (the digest runs on IST days).
export const istToday = (now = new Date()) => now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

// Morning email: today's meetings, follow-ups due, overdue payments, retainers to bill this week.
export function buildDigest({ leads = [], payments = [], retainers = [], meetings = [], clients = [] }, today) {
  const clientName = Object.fromEntries(clients.map(c => [c.id, c.name]))
  const weekEnd = new Date(`${today}T00:00:00Z`); weekEnd.setUTCDate(weekEnd.getUTCDate() + 7)
  const weekEndIso = weekEnd.toISOString().slice(0, 10)

  const sections = [
    ['Meetings today', meetings.filter(m => m.status === 'scheduled').sort((a, b) => a.starts_at.localeCompare(b.starts_at))
      .map(m => `${time(m.starts_at)} · ${m.title}${m.attendee_name ? ` with ${m.attendee_name}` : ''}`)],
    ['Follow-ups due', leads.filter(l => l.next_follow_up && l.next_follow_up <= today && !['won', 'lost'].includes(l.stage))
      .sort((a, b) => a.next_follow_up.localeCompare(b.next_follow_up))
      .map(l => `${l.name}${l.company ? ` (${l.company})` : ''} · ${l.next_follow_up < today ? `overdue since ${day(l.next_follow_up)}` : 'today'}`)],
    ['Overdue payments', payments.filter(p => p.status === 'pending' && p.due_on && p.due_on < today)
      .map(p => `${money(p.amount, p.currency)} from ${clientName[p.client_id] || 'a client'} · due ${day(p.due_on)}`)],
    ['Retainers to bill this week', retainers.filter(r => r.status === 'active' && r.next_billing_date && r.next_billing_date <= weekEndIso)
      .map(r => `${clientName[r.client_id] || 'A client'} · ${money(r.amount, r.currency)} (${r.title}) · ${day(r.next_billing_date)}`)],
  ].filter(([, items]) => items.length)

  const count = sections.reduce((n, [, items]) => n + items.length, 0)
  const subject = count ? `Vikku CRM: ${count} thing${count === 1 ? '' : 's'} need${count === 1 ? 's' : ''} attention today` : 'Vikku CRM: all clear today'
  const text = sections.map(([h, items]) => `${h}\n${items.map(i => `- ${i}`).join('\n')}`).join('\n\n') || 'Nothing due today.'
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;color:#0f172a">
<h2 style="margin:0 0 4px">Good morning</h2><p style="margin:0 0 20px;color:#64748b">Your Vikku CRM for ${esc(day(today))}</p>
${sections.map(([h, items]) => `<h3 style="margin:20px 0 8px;font-size:14px;color:#ea580c">${esc(h)}</h3><ul style="margin:0;padding-left:18px">${items.map(i => `<li style="margin:4px 0">${esc(i)}</li>`).join('')}</ul>`).join('') || '<p>Nothing due today.</p>'}
<p style="margin:28px 0 0"><a href="https://www.vikku.in/admin/crm" style="background:#ea580c;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Open the CRM</a></p></div>`
  return { count, subject, text, html }
}
