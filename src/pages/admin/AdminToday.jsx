import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Video, MessageCircle, Mail, AlertCircle, Repeat, FileText, CalendarClock, Sparkles } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { fmtDate } from './crm/Lists'
import { useAuth } from '../../contexts/AuthContext'
import { getAdminOverview } from '../../lib/adminService'
import {
  activeMrr, billingSoon, formatMoney, listClients, listDocuments, listLeads, listMeetings, listPayments, listRetainers,
  moneyText, overduePayments, pipelineStats, sourceLabel, updateLead, whatsappNumber,
} from '../../lib/crmService'

// Admin home: what needs doing today (IST), then a few numbers. The tools-business stats live at /admin/overview.
const IST = 'Asia/Kolkata'
const istDay = (d = new Date()) => new Date(d).toLocaleDateString('en-CA', { timeZone: IST })
const plusDays = (ymd, n) => { const d = new Date(`${ymd}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
const timeText = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: IST })

function Card({ title, icon: Icon, count, to, children }) {
  return (
    <section className="glass rounded-2xl p-5 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className="text-orange-600" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {count > 0 && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-700">{count}</span>}
        {to && <Link to={to} className="ml-auto flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700">All <ArrowRight size={12} /></Link>}
      </div>
      {children}
    </section>
  )
}

const Empty = ({ children }) => <p className="text-xs text-white/30 py-1">{children}</p>
const Row = ({ children }) => <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5 text-xs">{children}</div>

function Stat({ label, value, hint }) {
  return (
    <div className="glass rounded-2xl px-4 py-3 min-w-0">
      <p className="text-[10px] text-white/40 uppercase tracking-widest">{label}</p>
      <p className="font-display font-bold text-lg text-white mt-1 break-words">{value}</p>
      {hint && <p className="text-[11px] text-white/40">{hint}</p>}
    </div>
  )
}

export default function AdminToday() {
  const { displayName } = useAuth()
  const [d, setD] = useState(null)
  const [signups, setSignups] = useState(null)
  const [error, setError] = useState('')

  const load = () => Promise.all([listLeads(), listClients(), listMeetings(), listPayments(), listRetainers(), listDocuments()])
    .then(([leads, clients, meetings, payments, retainers, docs]) => setD({ leads, clients, meetings, payments, retainers, docs }))
    .catch(e => setError(e.message))

  useEffect(() => {
    load()
    // Tool sign-ups come from the admin-stats function; the page works without them.
    getAdminOverview().then(o => setSignups((o.signupsByDay || []).slice(-7).reduce((n, x) => n + x.count, 0))).catch(() => {})
  }, [])

  const today = istDay()
  const v = useMemo(() => {
    if (!d) return null
    const clients = Object.fromEntries(d.clients.map(c => [c.id, c]))
    const leads = Object.fromEntries(d.leads.map(l => [l.id, l]))
    const weekAgo = Date.now() - 7 * 864e5
    return {
      clients, leads,
      meetings: d.meetings.filter(m => m.status === 'scheduled' && istDay(m.starts_at) === today),
      followUps: d.leads.filter(l => l.next_follow_up && l.next_follow_up <= today && !['won', 'lost'].includes(l.stage))
        .sort((a, b) => a.next_follow_up.localeCompare(b.next_follow_up)),
      newLeads: d.leads.filter(l => new Date(l.created_at) >= weekAgo).sort((a, b) => b.created_at.localeCompare(a.created_at)),
      overdue: overduePayments(d.payments, today),
      billing: billingSoon(d.retainers, today),
      quotes: d.docs.filter(q => q.status === 'sent'),
      pipeline: pipelineStats(d.leads),
      mrr: activeMrr(d.retainers),
    }
  }, [d, today])

  const later = async (lead) => {
    setError('')
    try { await updateLead(lead.id, { next_follow_up: plusDays(today, 1) }); await load() }
    catch (e) { setError(e.message) }
  }

  const who = (x) => x.client_id ? v.clients[x.client_id]?.name : x.lead_id ? v.leads[x.lead_id]?.name : x.attendee_name
  const hour = Number(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', hour12: false, timeZone: IST }))
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const todo = v ? v.meetings.length + v.followUps.length + v.overdue.length + v.billing.length + v.quotes.length : 0

  return (
    <AdminLayout>
      <div className="mb-5">
        <h1 className="font-display font-bold text-xl text-white">{greeting}{displayName ? `, ${displayName.split(' ')[0]}` : ''}</h1>
        <p className="text-xs text-white/40">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: IST })}
          {v && ` · ${todo ? `${todo} thing${todo === 1 ? '' : 's'} need you today` : 'All clear today'}`}
        </p>
      </div>

      {error && <div className="text-sm text-red-500 mb-3">{error}</div>}
      {!v ? (
        !error && <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Open pipeline" value={moneyText(v.pipeline.pipeline)} hint={`${v.pipeline.open} open lead${v.pipeline.open === 1 ? '' : 's'}`} />
            <Stat label="Retainers" value={moneyText(v.mrr)} hint="per month" />
            <Stat label="New leads" value={v.newLeads.length} hint="last 7 days" />
            <Stat label="Tool sign-ups" value={signups ?? '–'} hint="last 7 days" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Meetings today" icon={Video} count={v.meetings.length} to="/admin/crm/meetings">
              {!v.meetings.length ? <Empty>No meetings today.</Empty> : (
                <div className="divide-y divide-black/[0.05]">
                  {v.meetings.map(m => (
                    <Row key={m.id}>
                      <span className="font-semibold text-white w-16">{timeText(m.starts_at)}</span>
                      <span className="flex-1 min-w-0 truncate text-white/80">{m.title}{who(m) ? <span className="text-white/40"> · {who(m)}</span> : null}</span>
                      {m.location && <a href={m.location} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-medium px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700"><Video size={12} /> Join</a>}
                    </Row>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Follow-ups due" icon={CalendarClock} count={v.followUps.length} to="/admin/crm/leads">
              {!v.followUps.length ? <Empty>No follow-ups due.</Empty> : (
                <div className="divide-y divide-black/[0.05]">
                  {v.followUps.map(l => {
                    const wa = whatsappNumber(l.phone)
                    return (
                      <Row key={l.id}>
                        <div className="flex-1 min-w-[10rem]">
                          <p className="text-white truncate"><b>{l.name}</b>{l.company ? ` · ${l.company}` : ''}</p>
                          <p className="text-[11px] text-white/40">{sourceLabel(l.source)} · {l.next_follow_up < today ? `overdue since ${fmtDate(l.next_follow_up)}` : 'today'}</p>
                        </div>
                        {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700" aria-label={`WhatsApp ${l.name}`}><MessageCircle size={13} /></a>}
                        {l.email && <a href={`mailto:${l.email}`} className="p-1.5 rounded-lg bg-blue-50 text-blue-700" aria-label={`Email ${l.name}`}><Mail size={13} /></a>}
                        <button onClick={() => later(l)} className="px-2.5 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06]">Tomorrow</button>
                      </Row>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card title="Money to chase" icon={AlertCircle} count={v.overdue.length + v.billing.length} to="/admin/crm/payments">
              {!v.overdue.length && !v.billing.length ? <Empty>Nothing overdue, no retainers to bill this week.</Empty> : (
                <div className="divide-y divide-black/[0.05]">
                  {v.overdue.map(p => (
                    <Row key={p.id}>
                      <AlertCircle size={13} className="text-amber-500" />
                      <Link to={`/admin/crm/clients/${p.client_id}`} className="flex-1 min-w-0 truncate text-white/80"><b className="text-white">{formatMoney(p.amount, p.currency)}</b> overdue from {v.clients[p.client_id]?.name || 'a client'}</Link>
                      <span className="text-white/40">due {fmtDate(p.due_on)}</span>
                    </Row>
                  ))}
                  {v.billing.map(r => (
                    <Row key={r.id}>
                      <Repeat size={13} className="text-orange-500" />
                      <Link to={`/admin/crm/clients/${r.client_id}`} className="flex-1 min-w-0 truncate text-white/80">Bill <b className="text-white">{v.clients[r.client_id]?.name}</b> {formatMoney(r.amount, r.currency)} · {r.title}</Link>
                      <span className="text-white/40">{fmtDate(r.next_billing_date)}</span>
                    </Row>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Quotes waiting for an answer" icon={FileText} count={v.quotes.length} to="/admin/crm/quotes">
              {!v.quotes.length ? <Empty>No quotes waiting.</Empty> : (
                <div className="divide-y divide-black/[0.05]">
                  {v.quotes.map(q => (
                    <Row key={q.id}>
                      <span className="font-mono text-[11px] text-white/40">{q.number}</span>
                      <span className="flex-1 min-w-0 truncate text-white/80">{q.title}{who(q) ? <span className="text-white/40"> · {who(q)}</span> : null}</span>
                      <span className="font-semibold text-white">{formatMoney(q.total, q.currency)}</span>
                      {q.valid_until && <span className={q.valid_until < today ? 'text-rose-600' : 'text-white/40'}>{q.valid_until < today ? 'expired' : 'valid until'} {fmtDate(q.valid_until)}</span>}
                    </Row>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card title="New leads this week" icon={Sparkles} count={v.newLeads.length} to="/admin/crm/leads">
            {!v.newLeads.length ? <Empty>No new leads this week. Website and free-tool sign-ups appear here automatically.</Empty> : (
              <div className="divide-y divide-black/[0.05]">
                {v.newLeads.map(l => (
                  <Row key={l.id}>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">{sourceLabel(l.source)}</span>
                    <span className="text-white"><b>{l.name}</b>{l.email ? <span className="text-white/40"> · {l.email}</span> : null}</span>
                    {l.notes && <span className="basis-full sm:basis-auto sm:flex-1 min-w-0 text-white/50 truncate">{linkify(l.notes)}</span>}
                    <span className="text-white/40 ml-auto">{fmtDate(l.created_at)}</span>
                  </Row>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </AdminLayout>
  )
}

// Website leads carry a link to their saved tool result in the notes; make it clickable.
function linkify(text) {
  const m = text.match(/https:\/\/www\.vikku\.in\/r\/[\w-]+/)
  if (!m) return text
  return <>{text.slice(0, m.index)}<a href={m[0]} target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">their result</a>{text.slice(m.index + m[0].length)}</>
}
