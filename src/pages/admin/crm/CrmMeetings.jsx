import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Video, ChevronLeft, ChevronRight, Pencil, Trash2, CalendarCheck, AlertTriangle } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import { Badge, EmptyState, PageHead, Skeleton } from '../ui'
import { Modal } from './Forms'
import useOpenOnParam from '../../../hooks/useOpenOnParam'
import { Field, inputCls } from './LeadPanel'
import {
  MEETING_STATUSES, createMeeting, deleteMeeting, listClients, listLeads, listMeetings, meetingsByDay, updateMeeting,
} from '../../../lib/crmService'

const IST = 'Asia/Kolkata'
const istDay = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: IST })
const timeText = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: IST })
const dayText = (ymd) => new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'UTC' })
const statusOf = (id) => MEETING_STATUSES.find(s => s.id === id)
const toLocalInput = (iso) => { const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16) }

function MeetingForm({ meeting, leads, clients, onClose, onSaved }) {
  const start = meeting ? toLocalInput(meeting.starts_at) : toLocalInput(new Date(Date.now() + 3600e3).setMinutes(0, 0, 0))
  const dur = meeting?.ends_at ? Math.round((new Date(meeting.ends_at) - new Date(meeting.starts_at)) / 60000) : 30
  const [form, setForm] = useState({
    title: meeting?.title || 'Discovery call', start, duration: String(dur || 30),
    link: meeting?.client_id ? `c:${meeting.client_id}` : meeting?.lead_id ? `l:${meeting.lead_id}` : '',
    location: meeting?.location || '', notes: meeting?.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.start) { setError('Add a title and a start time.'); return }
    setSaving(true); setError('')
    const startsAt = new Date(form.start)
    const data = {
      title: form.title.trim(), starts_at: startsAt.toISOString(),
      ends_at: new Date(startsAt.getTime() + Number(form.duration) * 60000).toISOString(),
      client_id: form.link.startsWith('c:') ? form.link.slice(2) : null,
      lead_id: form.link.startsWith('l:') ? form.link.slice(2) : null,
      location: form.location.trim() || null, notes: form.notes.trim() || null,
    }
    try { onSaved(meeting ? await updateMeeting(meeting.id, data) : await createMeeting(data)) }
    catch (err) { setError(err.message); setSaving(false) }
  }

  return (
    <Modal title={meeting ? 'Edit meeting' : 'Schedule meeting'} onClose={onClose} onSubmit={save} saving={saving} error={error} submitLabel={meeting ? 'Save changes' : 'Schedule'}>
      <Field label="Title *" wide><input className={inputCls} value={form.title} onChange={set('title')} autoFocus /></Field>
      <Field label="With">
        <select className={inputCls} value={form.link} onChange={set('link')}>
          <option value="" className="bg-black">Not linked</option>
          <optgroup label="Clients">{clients.map(c => <option key={c.id} value={`c:${c.id}`} className="bg-black">{c.name}{c.company ? ` · ${c.company}` : ''}</option>)}</optgroup>
          <optgroup label="Leads">{leads.filter(l => !l.client_id).map(l => <option key={l.id} value={`l:${l.id}`} className="bg-black">{l.name}{l.company ? ` · ${l.company}` : ''}</option>)}</optgroup>
        </select>
      </Field>
      <Field label="Starts *"><input className={inputCls} type="datetime-local" value={form.start} onChange={set('start')} /></Field>
      <Field label="Duration">
        <select className={inputCls} value={form.duration} onChange={set('duration')}>
          {[15, 30, 45, 60, 90, 120].map(m => <option key={m} value={m} className="bg-black">{m} minutes</option>)}
        </select>
      </Field>
      <Field label="Meeting link"><input className={inputCls} value={form.location} onChange={set('location')} placeholder="https://meet.google.com/…" /></Field>
      <Field label="Notes" wide><textarea className={`${inputCls} resize-none`} rows={2} value={form.notes} onChange={set('notes')} /></Field>
    </Modal>
  )
}

export default function CrmMeetings() {
  const [meetings, setMeetings] = useState([])
  const [leads, setLeads] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('upcoming') // upcoming | past | week
  const [weekOffset, setWeekOffset] = useState(0)
  const [modal, setModal] = useState(null)
  useOpenOnParam('new', () => setModal({}), !loading)

  const load = async () => {
    setError('')
    try {
      const [m, l, c] = await Promise.all([listMeetings(), listLeads(), listClients()])
      setMeetings(m); setLeads(l); setClients(c)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  // null until known: the check only runs on the deployed site, so a dev server shows no warning.
  const [calReady, setCalReady] = useState(null)
  useEffect(() => {
    fetch('/api/cal-webhook').then(r => (r.ok ? r.json() : null)).then(d => setCalReady(typeof d?.ready === 'boolean' ? d.ready : null)).catch(() => {})
  }, [])
  const lastCal = meetings.filter(m => m.source === 'cal').map(m => m.created_at).sort().pop()
  const run = async (fn) => { setError(''); try { await fn(); await load() } catch (err) { setError(err.message) } }

  const leadsById = useMemo(() => Object.fromEntries(leads.map(l => [l.id, l])), [leads])
  const clientsById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c])), [clients])
  const now = Date.now()
  const today = istDay(new Date())

  const agenda = useMemo(() => {
    const list = meetings.filter(m => view === 'past' ? new Date(m.starts_at) < now - 3600e3 : new Date(m.starts_at) >= now - 3600e3)
    const days = meetingsByDay(list)
    return view === 'past' ? days.reverse().map(([d, ms]) => [d, [...ms].reverse()]) : days
  }, [meetings, view])

  const weekDays = useMemo(() => {
    const t = new Date(`${today}T12:00:00Z`)
    const monday = new Date(t); monday.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7) + weekOffset * 7)
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setUTCDate(monday.getUTCDate() + i); return d.toISOString().slice(0, 10) })
  }, [today, weekOffset])

  const setStatus = (m, status) => {
    let outcome = m.outcome
    if (status !== 'scheduled') {
      const typed = prompt(status === 'completed' ? 'How did it go? (optional)' : 'Add a note (optional)', m.outcome || '')
      if (typed === null) return
      outcome = typed || null
    }
    run(() => updateMeeting(m.id, { status, outcome }))
  }

  const who = (m) => {
    if (m.client_id && clientsById[m.client_id]) return <Link to={`/admin/crm/clients/${m.client_id}`} className="text-slate-700 hover:text-slate-900 underline underline-offset-2">{clientsById[m.client_id].name}</Link>
    if (m.lead_id && leadsById[m.lead_id]) return <Link to="/admin/crm/leads" className="text-slate-700 hover:text-slate-900 underline underline-offset-2">{leadsById[m.lead_id].name} (lead)</Link>
    return m.attendee_name || m.attendee_email || 'Not linked'
  }

  const Row = ({ m, compact }) => {
    const st = statusOf(m.status)
    return (
      <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 ${compact ? 'bg-white rounded-ui p-2.5 shadow-ui-sm border border-slate-200 hover:border-slate-300' : 'py-3'}`}>
        <span className="text-[12.5px] font-semibold text-slate-900 w-16 flex-shrink-0 tabular-nums">{timeText(m.starts_at)}</span>
        <div className={`flex-1 ${compact ? 'basis-full order-last min-w-0' : 'min-w-[12rem]'}`}>
          <p className="text-[13px] font-medium text-slate-900 truncate">{m.title}</p>
          <p className="text-[12px] text-slate-500 truncate">{who(m)}{m.outcome ? ` · ${m.outcome}` : ''}</p>
        </div>
        <Badge tone={st?.tone}>{st?.label}</Badge>
        {m.source === 'cal' && <Badge tone="violet">Cal.com</Badge>}
        {!compact && (
          <div className="flex items-center gap-1">
            {m.location && m.status === 'scheduled' && <a href={m.location} target="_blank" rel="noopener noreferrer" className="act"><Video size={14} /> Join</a>}
            {m.status === 'scheduled' ? (
              <>
                <button onClick={() => setStatus(m, 'completed')} className="act">Done</button>
                <button onClick={() => setStatus(m, 'no_show')} className="btn btn-ghost btn-sm text-slate-600">No-show</button>
                <button onClick={() => setStatus(m, 'cancelled')} className="btn btn-ghost btn-sm text-slate-600 hover:!text-[var(--red)]">Cancel</button>
              </>
            ) : <button onClick={() => setStatus(m, 'scheduled')} className="btn btn-ghost btn-sm text-slate-600">Reopen</button>}
            <button onClick={() => setModal({ item: m })} className="icon-act" aria-label="Edit meeting"><Pencil size={15} /></button>
            <button onClick={() => confirm(`Delete "${m.title}"?`) && run(() => deleteMeeting(m.id))} className="icon-act hover:!text-[var(--red)] hover:!bg-[var(--red-bg)]" aria-label="Delete meeting"><Trash2 size={15} /></button>
          </div>
        )}
      </div>
    )
  }

  return (
    <AdminLayout>
      <PageHead title="Meetings" sub="Your schedule in India time (IST)">
        <div className="inline-flex p-[3px] bg-slate-100 border border-slate-200 rounded-ui" role="group" aria-label="View">
          {[['upcoming', 'Upcoming'], ['week', 'Week'], ['past', 'Past']].map(([id, label]) => (
            <button key={id} onClick={() => setView(id)} aria-pressed={view === id}
              className={`h-7 px-3 rounded-ui-sm text-[13px] font-medium ${view === id ? 'bg-white text-slate-900 shadow-ui' : 'text-slate-500 hover:text-slate-900'}`}>{label}</button>
          ))}
        </div>
        <button onClick={() => setModal({})} className="btn btn-primary"><Plus /> Schedule</button>
      </PageHead>

      {calReady === false ? (
        <div role="alert" className="rounded-ui-lg border border-[var(--red-bd)] bg-[var(--red-bg)] p-4 mb-4 flex items-start gap-3 text-[13px] text-[var(--red)]">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <p><strong>Cal.com bookings can't reach your admin.</strong> The site is missing <code>CAL_WEBHOOK_SECRET</code>, so every booking is turned away. Add it in Vercel → Settings → Environment Variables for Production, use the same secret on your Cal.com webhook, then redeploy. Bookings made before then won't come through, so add them with Schedule.</p>
        </div>
      ) : (
        <div className="card p-4 mb-4 flex items-start gap-3 text-[13px]">
          <CalendarCheck size={16} aria-hidden="true" className="text-slate-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-slate-600">Bookings from your Cal.com page appear here automatically and create a lead for new people. Connect it once in Cal.com → Settings → Developer → Webhooks with the URL <span className="font-mono text-[12px] text-slate-900 select-all">https://www.vikku.in/api/cal-webhook</span>.</p>
            {!loading && <p className="text-slate-500">{lastCal ? `Last Cal.com booking received ${new Date(lastCal).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: IST })}.` : 'No Cal.com bookings received yet. If someone has booked, check the webhook URL and secret in Cal.com.'}</p>}
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-3 rounded-ui border border-[var(--red-bd)] bg-[var(--red-bg)] px-4 py-2.5 text-[13px] text-[var(--red)]">
          {error}<button type="button" onClick={load} className="btn btn-sm ml-auto">Try again</button>
        </div>
      )}

      {view === 'week' ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[14px] font-semibold text-slate-900 mr-auto tabular-nums">{dayText(weekDays[0])} – {dayText(weekDays[6])}</p>
            <button onClick={() => setWeekOffset(0)} className="btn btn-sm">Today</button>
            <button onClick={() => setWeekOffset(w => w - 1)} className="btn btn-sm btn-icon" aria-label="Previous week"><ChevronLeft size={16} /></button>
            <button onClick={() => setWeekOffset(w => w + 1)} className="btn btn-sm btn-icon" aria-label="Next week"><ChevronRight size={16} /></button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-3">
            {weekDays.map(d => {
              const items = meetings.filter(m => istDay(m.starts_at) === d).sort((a, b) => a.starts_at.localeCompare(b.starts_at))
              return (
                <section key={d} className={`w-48 flex-shrink-0 rounded-ui-lg border p-2.5 min-h-[260px] ${d === today ? 'bg-white border-slate-300 shadow-ui-sm' : 'bg-slate-100/70 border-slate-200'}`}>
                  <p className={`text-[12.5px] font-semibold mb-2 tabular-nums ${d === today ? 'text-slate-900' : 'text-slate-500'}`}>{d === today ? 'Today · ' : ''}{dayText(d)}</p>
                  <div className="space-y-1.5">
                    {items.map(m => <div key={m.id} onClick={() => setModal({ item: m })} className="cursor-pointer"><Row m={m} compact /></div>)}
                    {!items.length && <p className="text-[12px] text-slate-400 text-center py-4">Free</p>}
                  </div>
                </section>
              )
            })}
          </div>
        </>
      ) : loading ? (
        <div className="card p-4 space-y-4">{[0, 1, 2].map(i => <div key={i} className="flex items-center gap-4"><Skeleton className="h-4 w-14" /><Skeleton className="h-4 flex-1 max-w-xs" /><Skeleton className="ml-auto h-6 w-20 rounded-full" /></div>)}</div>
      ) : agenda.length === 0 ? (
        <div className="card"><EmptyState icon={CalendarCheck} title={view === 'past' ? 'No past meetings.' : 'No upcoming meetings.'} /></div>
      ) : (
        <div className="space-y-4">
          {agenda.map(([d, ms]) => (
            <section key={d} className="card">
              <h2 className="card-head !min-h-0 !py-3 text-[13px] font-semibold text-slate-900 tabular-nums">{d === today ? 'Today · ' : ''}{dayText(d)}</h2>
              <div className="divide-y divide-slate-200 px-4">{ms.map(m => <Row key={m.id} m={m} />)}</div>
            </section>
          ))}
        </div>
      )}

      {modal && <MeetingForm meeting={modal.item} leads={leads} clients={clients} onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }} />}
    </AdminLayout>
  )
}
