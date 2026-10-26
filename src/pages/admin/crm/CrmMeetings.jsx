import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Video, ChevronLeft, ChevronRight, Pencil, Trash2, CalendarCheck } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import { Modal } from './Forms'
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

  const load = async () => {
    setError('')
    try {
      const [m, l, c] = await Promise.all([listMeetings(), listLeads(), listClients()])
      setMeetings(m); setLeads(l); setClients(c)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
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
    if (m.client_id && clientsById[m.client_id]) return <Link to={`/admin/crm/clients/${m.client_id}`} className="text-white/70 hover:text-white underline underline-offset-2">{clientsById[m.client_id].name}</Link>
    if (m.lead_id && leadsById[m.lead_id]) return <Link to="/admin/crm/leads" className="text-white/70 hover:text-white underline underline-offset-2">{leadsById[m.lead_id].name} (lead)</Link>
    return m.attendee_name || m.attendee_email || 'Not linked'
  }

  const Row = ({ m, compact }) => {
    const st = statusOf(m.status)
    return (
      <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${compact ? 'bg-[var(--surface)] rounded-xl p-2.5 shadow-sm border border-black/[0.04]' : 'py-3'}`}>
        <span className="text-xs font-semibold text-white w-16 flex-shrink-0">{timeText(m.starts_at)}</span>
        <div className={`flex-1 ${compact ? 'basis-full order-last min-w-0' : 'min-w-[12rem]'}`}>
          <p className="text-sm font-medium text-white truncate">{m.title}</p>
          <p className="text-[11px] text-white/40 truncate">{who(m)}{m.outcome ? ` · ${m.outcome}` : ''}</p>
        </div>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st?.tone}`}>{st?.label}</span>
        {m.source === 'cal' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">Cal.com</span>}
        {!compact && (
          <div className="flex items-center gap-1">
            {m.location && m.status === 'scheduled' && <a href={m.location} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700"><Video size={12} /> Join</a>}
            {m.status === 'scheduled' ? (
              <>
                <button onClick={() => setStatus(m, 'completed')} className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">Done</button>
                <button onClick={() => setStatus(m, 'no_show')} className="text-[11px] px-2.5 py-1.5 rounded-lg text-white/50 hover:text-white">No-show</button>
                <button onClick={() => setStatus(m, 'cancelled')} className="text-[11px] px-2.5 py-1.5 rounded-lg text-white/50 hover:text-red-500">Cancel</button>
              </>
            ) : <button onClick={() => setStatus(m, 'scheduled')} className="text-[11px] px-2.5 py-1.5 rounded-lg text-white/50 hover:text-white">Reopen</button>}
            <button onClick={() => setModal({ item: m })} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06]" aria-label="Edit meeting"><Pencil size={13} /></button>
            <button onClick={() => confirm(`Delete "${m.title}"?`) && run(() => deleteMeeting(m.id))} className="p-1.5 rounded-lg text-white/30 hover:text-red-500 hover:bg-red-50" aria-label="Delete meeting"><Trash2 size={13} /></button>
          </div>
        )}
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="mr-auto">
          <h1 className="font-display font-bold text-lg text-white">Meetings</h1>
          <p className="text-xs text-white/40">Your schedule in India time (IST)</p>
        </div>
        <div className="flex rounded-xl glass p-1 text-xs">
          {[['upcoming', 'Upcoming'], ['week', 'Week'], ['past', 'Past']].map(([id, label]) => (
            <button key={id} onClick={() => setView(id)} className={`px-3 py-1.5 rounded-lg ${view === id ? 'bg-white text-white font-medium shadow-sm' : 'text-white/50 hover:text-white'}`}>{label}</button>
          ))}
        </div>
        <button onClick={() => setModal({})} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-xl"><Plus size={13} /> Schedule</button>
      </div>

      <div className="glass rounded-2xl p-4 mb-4 flex items-start gap-3 text-xs">
        <CalendarCheck size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
        <p className="text-white/60">Bookings from your Cal.com page appear here automatically and create a lead for new people. Connect it once in Cal.com → Settings → Developer → Webhooks with the URL <span className="font-mono text-white select-all">https://www.vikku.in/api/cal-webhook</span>.</p>
      </div>

      {error && <div className="text-sm text-red-500 mb-3">{error}</div>}

      {view === 'week' ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-sm font-semibold text-white mr-auto">{dayText(weekDays[0])} – {dayText(weekDays[6])}</p>
            <button onClick={() => setWeekOffset(0)} className="text-xs px-3 py-1.5 rounded-lg glass text-white/70">Today</button>
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-lg glass text-white/70" aria-label="Previous week"><ChevronLeft size={14} /></button>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg glass text-white/70" aria-label="Next week"><ChevronRight size={14} /></button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-3">
            {weekDays.map(d => {
              const items = meetings.filter(m => istDay(m.starts_at) === d).sort((a, b) => a.starts_at.localeCompare(b.starts_at))
              return (
                <section key={d} className={`w-48 flex-shrink-0 rounded-2xl border p-2.5 min-h-[260px] ${d === today ? 'bg-orange-50 border-orange-100' : 'bg-black/[0.02] border-black/[0.04]'}`}>
                  <p className={`text-xs font-semibold mb-2 ${d === today ? 'text-orange-600' : 'text-white/60'}`}>{dayText(d)}</p>
                  <div className="space-y-1.5">
                    {items.map(m => <div key={m.id} onClick={() => setModal({ item: m })} className="cursor-pointer"><Row m={m} compact /></div>)}
                    {!items.length && <p className="text-[11px] text-white/25 text-center py-4">Free</p>}
                  </div>
                </section>
              )
            })}
          </div>
        </>
      ) : loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>
      ) : agenda.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-white/40">{view === 'past' ? 'No past meetings.' : 'No upcoming meetings.'}</div>
      ) : (
        <div className="space-y-4">
          {agenda.map(([d, ms]) => (
            <section key={d} className="glass rounded-2xl px-5 py-3">
              <h2 className={`text-xs font-semibold pt-1 ${d === today ? 'text-orange-600' : 'text-white/50'}`}>{d === today ? 'Today · ' : ''}{dayText(d)}</h2>
              <div className="divide-y divide-black/[0.05]">{ms.map(m => <Row key={m.id} m={m} />)}</div>
            </section>
          ))}
        </div>
      )}

      {modal && <MeetingForm meeting={modal.item} leads={leads} clients={clients} onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }} />}
    </AdminLayout>
  )
}
