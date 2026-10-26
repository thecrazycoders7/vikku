// Run: node api/_crm.test.mjs
import assert from 'node:assert/strict'
import { calBooking, buildDigest, istToday, esc } from './_crm.js'

// Cal.com BOOKING_CREATED (shape from Cal.com webhook docs)
const created = calBooking({
  triggerEvent: 'BOOKING_CREATED',
  payload: {
    uid: 'bk_1', title: '30 Min Meeting between Vikku and Asha', startTime: '2026-10-28T05:30:00Z', endTime: '2026-10-28T06:00:00Z',
    attendees: [{ name: 'Asha Rao', email: 'Asha@RaoClinics.in', timeZone: 'Asia/Kolkata' }],
    responses: { name: { value: 'Asha Rao' }, email: { value: 'asha@raoclinics.in' }, notes: { value: 'Need a WhatsApp bot' } },
    location: 'integrations:daily', metadata: { videoCallUrl: 'https://app.cal.com/video/bk_1' },
  },
})
assert.equal(created.event, 'BOOKING_CREATED')
assert.equal(created.person.email, 'asha@raoclinics.in')          // lower-cased for matching
assert.equal(created.person.notes, 'Need a WhatsApp bot')
assert.equal(created.meeting.location, 'https://app.cal.com/video/bk_1')
assert.equal(created.previousUid, null)

const moved = calBooking({ triggerEvent: 'BOOKING_RESCHEDULED', payload: { uid: 'bk_2', rescheduleUid: 'bk_1', startTime: '2026-10-29T05:30:00Z', attendees: [{ email: 'a@b.c' }], location: 'https://meet.google.com/xyz' } })
assert.equal(moved.previousUid, 'bk_1')
assert.equal(moved.meeting.location, 'https://meet.google.com/xyz')
assert.equal(moved.person.name, 'a@b.c')                            // falls back to email
assert.equal(calBooking({ triggerEvent: 'PING', payload: {} }), null)
assert.equal(calBooking({ triggerEvent: 'MEETING_ENDED', payload: { uid: 'x' } }), null)

assert.equal(istToday(new Date('2026-10-27T20:00:00Z')), '2026-10-28') // 01:30 IST next day
assert.equal(esc('<b>"x"</b>'), '&lt;b&gt;&quot;x&quot;&lt;/b&gt;')

const d = buildDigest({
  clients: [{ id: 'c1', name: 'Jobly <Solutions>' }],
  leads: [
    { name: 'Asha', next_follow_up: '2026-10-26', stage: 'qualified' },
    { name: 'Won lead', next_follow_up: '2026-10-01', stage: 'won' },
    { name: 'Later', next_follow_up: '2026-11-05', stage: 'new' },
  ],
  payments: [{ client_id: 'c1', amount: 100000, currency: 'INR', status: 'pending', due_on: '2026-10-20' }],
  retainers: [{ client_id: 'c1', amount: 15000, currency: 'INR', status: 'active', title: 'Support', next_billing_date: '2026-10-30' }],
  meetings: [{ title: 'Discovery', attendee_name: 'Asha', starts_at: '2026-10-28T05:30:00Z', status: 'scheduled' }],
}, '2026-10-28')
assert.equal(d.count, 4)
assert.equal(d.subject, 'Vikku CRM: 4 things need attention today')
assert.ok(d.text.includes('11:00 am · Discovery with Asha') || d.text.includes('11:00 AM · Discovery with Asha'), d.text)
assert.ok(d.text.includes('Asha · overdue since 26 Oct'))
assert.ok(!d.text.includes('Won lead') && !d.text.includes('Later'))
assert.ok(d.html.includes('Jobly &lt;Solutions&gt;') && !d.html.includes('Jobly <Solutions>'))  // escaped
assert.equal(buildDigest({}, '2026-10-28').count, 0)
console.log('api/_crm: all checks passed')
