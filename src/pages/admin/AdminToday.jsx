import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, ChevronDown, Video, MessageCircle, Mail, CalendarDays, CalendarClock, FileText, FolderKanban, Wallet, Repeat,
  Target, UserPlus, Briefcase, ArrowRightLeft, BadgeCheck, StickyNote, Phone, CircleCheckBig, RefreshCw,
} from 'lucide-react'
import AdminLayout from './AdminLayout'
import { Badge, EmptyState, KpiCard, Menu, MenuItem, Panel, Skeleton, Sparkline, Trend, ViewAll, useToast } from './ui'
import { useAuth } from '../../contexts/AuthContext'
import { getAdminOverview } from '../../lib/adminService'
import {
  activeMrr, billingSoon, formatMoney, listClients, listDocuments, listLeads, listMeetings, listPayments, listProjects,
  listRecentActivity, listRetainers, moneyText, monthStats, overduePayments, pipelineStats, sourceLabel, stageLabel,
  sumByCurrency, updateLead, whatsappNumber,
} from '../../lib/crmService'

// Admin home: four headline numbers, today's priorities, follow-ups and recent CRM activity.
// Every figure comes from the CRM tables (same definitions as the CRM pages); days are India time.
const IST = 'Asia/Kolkata'
const istDay = (d = new Date()) => new Date(d).toLocaleDateString('en-CA', { timeZone: IST })
const plusDays = (ymd, n) => { const d = new Date(`${ymd}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
const dayDiff = (a, b) => Math.round((new Date(`${a}T12:00:00Z`) - new Date(`${b}T12:00:00Z`)) / 864e5)
const timeText = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', timeZone: IST })
const dateText = (ymd) => new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const weekdayText = (ymd) => new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
const OPEN = (l) => !['won', 'lost'].includes(l.stage)

function ago(iso) {
  const s = (Date.now() - new Date(iso)) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 172800) return 'yesterday'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: IST })
}

const CREATE = [
  { label: 'New lead',         icon: Target,       to: '/admin/crm/leads?new=1' },
  { label: 'New client',       icon: Briefcase,    to: '/admin/crm/clients?new=1' },
  { label: 'New project',      icon: FolderKanban, to: '/admin/crm/projects?new=1' },
  { label: 'New quote',        icon: FileText,     to: '/admin/crm/quotes?new=1' },
  { label: 'Schedule meeting', icon: CalendarDays, to: '/admin/crm/meetings?new=1' },
]

const ACTIVITY_ICON = {
  created: UserPlus, stage_change: ArrowRightLeft, converted: BadgeCheck, project: FolderKanban, payment: Wallet,
  document: FileText, meeting: CalendarDays, note: StickyNote, call: Phone, email: Mail, whatsapp: MessageCircle,
}

// What the dashboard shows, worked out from the raw CRM rows.
function buildView(d, today) {
  const clients = Object.fromEntries(d.clients.map(c => [c.id, c]))
  const leads = Object.fromEntries(d.leads.map(l => [l.id, l]))
  const who = (x) => (x.client_id && clients[x.client_id]?.name) || (x.lead_id && leads[x.lead_id]?.name) || x.attendee_name || ''
  const weekAgo = plusDays(today, -7), twoWeeksAgo = plusDays(today, -14), inWeek = plusDays(today, 7)
  const created = (l) => istDay(l.created_at)

  // KPI history: received payments per month (last 6) and new leads per week (last 8), from real dates only.
  const months = Array.from({ length: 6 }, (_, i) => { const x = new Date(); x.setDate(1); x.setMonth(x.getMonth() - 5 + i); return x.toISOString().slice(0, 7) })
  const received = d.payments.filter(p => p.status === 'received' && p.paid_on)
  const revenueByMonth = months.map(m => received.filter(p => p.paid_on.startsWith(m)).reduce((s, p) => s + (p.currency === 'INR' ? Number(p.amount) : 0), 0))
  const leadsByWeek = Array.from({ length: 8 }, (_, i) => {
    const end = plusDays(today, -7 * (7 - i)), start = plusDays(end, -6)
    return d.leads.filter(l => created(l) >= start && created(l) <= end).length
  })

  const thisMonth = today.slice(0, 7)
  const paidThisMonth = received.filter(p => p.paid_on.startsWith(thisMonth))
  const pending = d.payments.filter(p => p.status === 'pending')
  const activeProjects = d.projects.filter(p => ['new', 'ongoing'].includes(p.stage))

  const priorities = []
  for (const m of d.meetings) {
    if (m.status !== 'scheduled') continue
    const day = istDay(m.starts_at), diff = dayDiff(day, today)
    if (diff < 0 || diff > 1 || new Date(m.starts_at) < Date.now() - 3600e3) continue
    priorities.push({
      key: `m${m.id}`, rank: diff ? 2 : 1, sort: m.starts_at, icon: Video, title: m.title, sub: who(m),
      when: `${diff ? 'Tomorrow' : 'Today'}, ${timeText(m.starts_at)}`, badge: [diff ? 'slate' : 'blue', 'Meeting'],
      action: m.location ? { label: 'Join', href: m.location } : { label: 'Open', to: '/admin/crm/meetings' },
    })
  }
  for (const p of overduePayments(d.payments, today)) {
    priorities.push({
      key: `p${p.id}`, rank: 0, sort: p.due_on, icon: Wallet, title: `${formatMoney(p.amount, p.currency)} payment overdue`,
      sub: clients[p.client_id]?.name, when: `Due ${dateText(p.due_on)}`, badge: ['red', 'Overdue'],
      action: { label: 'Open', to: `/admin/crm/clients/${p.client_id}` },
    })
  }
  for (const r of billingSoon(d.retainers, today)) {
    priorities.push({
      key: `r${r.id}`, rank: 3, sort: r.next_billing_date, icon: Repeat, title: `Bill ${r.title} · ${formatMoney(r.amount, r.currency)}`,
      sub: clients[r.client_id]?.name, when: weekdayText(r.next_billing_date), badge: ['amber', 'Retainer'],
      action: { label: 'Open', to: '/admin/crm/payments' },
    })
  }
  for (const q of d.docs.filter(x => x.status === 'sent')) {
    const expired = q.valid_until && q.valid_until < today
    priorities.push({
      key: `q${q.id}`, rank: expired ? 0 : 4, sort: q.valid_until || '9999', icon: FileText, title: `${q.number} · ${q.title}`,
      sub: who(q), when: q.valid_until ? `${expired ? 'Expired' : 'Valid until'} ${dateText(q.valid_until)}` : 'Sent',
      badge: expired ? ['red', 'Expired'] : ['slate', 'Awaiting reply'], action: { label: 'Open', to: '/admin/crm/quotes' },
    })
  }
  for (const p of activeProjects.filter(x => x.due_date && x.due_date <= inWeek)) {
    const late = p.due_date < today
    priorities.push({
      key: `j${p.id}`, rank: late ? 0 : 3, sort: p.due_date, icon: FolderKanban, title: p.name, sub: clients[p.client_id]?.name,
      when: `${late ? 'Was due' : 'Due'} ${weekdayText(p.due_date)}`, badge: late ? ['red', 'Past deadline'] : ['amber', 'Deadline'],
      action: { label: 'Open', to: '/admin/crm/projects' },
    })
  }
  for (const l of d.leads.filter(x => OPEN(x) && !x.next_follow_up)) {
    priorities.push({
      key: `l${l.id}`, rank: 5, sort: l.created_at, icon: Target, title: l.name, sub: l.company || sourceLabel(l.source),
      when: `Added ${dateText(created(l))}`, badge: ['slate', 'No next step'], action: { label: 'Open', to: `/admin/crm/leads?lead=${l.id}` },
    })
  }
  priorities.sort((a, b) => a.rank - b.rank || a.sort.localeCompare(b.sort))

  const due = d.leads.filter(l => OPEN(l) && l.next_follow_up && l.next_follow_up <= inWeek)
    .sort((a, b) => a.next_follow_up.localeCompare(b.next_follow_up))

  return {
    clients, leads, who, priorities,
    followUps: {
      overdue: due.filter(l => l.next_follow_up < today),
      today: due.filter(l => l.next_follow_up === today),
      upcoming: due.filter(l => l.next_follow_up > today),
    },
    pipeline: pipelineStats(d.leads),
    revenue: monthStats({ projects: d.projects, payments: d.payments, expenses: [] }).received,
    revenueByMonth, paidThisMonth, pending: sumByCurrency(pending), pendingCount: pending.length,
    newLeads: d.leads.filter(l => created(l) > weekAgo).length,
    prevLeads: d.leads.filter(l => created(l) > twoWeeksAgo && created(l) <= weekAgo).length,
    leadsByWeek,
    activeProjects: activeProjects.length,
    ongoing: activeProjects.filter(p => p.stage === 'ongoing').length,
    dueSoon: activeProjects.filter(p => p.due_date && p.due_date >= today && p.due_date <= plusDays(today, 14)).length,
    mrr: activeMrr(d.retainers),
    quotesWaiting: d.docs.filter(x => x.status === 'sent').length,
  }
}

function PriorityRow({ p }) {
  const Icon = p.icon
  const action = p.action.href
    ? <a href={p.action.href} target="_blank" rel="noopener noreferrer" className="act">{p.action.label}</a>
    : <Link to={p.action.to} className="act">{p.action.label}</Link>
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200"><Icon size={15} /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-slate-900">{p.title}</p>
        <p className="truncate text-[12px] text-slate-500">{[p.sub, p.when].filter(Boolean).join(' · ')}</p>
      </div>
      <span className="hidden sm:block"><Badge tone={p.badge[0]}>{p.badge[1]}</Badge></span>
      {action}
    </li>
  )
}

function FollowUpRow({ lead, state, today, onLater }) {
  const wa = whatsappNumber(lead.phone)
  const late = state === 'overdue' ? dayDiff(today, lead.next_follow_up) : 0
  const when = state === 'overdue' ? `${late} day${late === 1 ? '' : 's'} overdue` : state === 'today' ? 'Due today' : weekdayText(lead.next_follow_up)
  return (
    <li className="flex items-center gap-3 px-5 py-2.5">
      <div className="min-w-0 flex-1">
        <Link to={`/admin/crm/leads?lead=${lead.id}`} className="block truncate text-[13px] font-medium text-slate-900 hover:text-orange-700 rounded">{lead.name}</Link>
        <p className="truncate text-[12px] text-slate-500">{lead.company || sourceLabel(lead.source)} · {when}</p>
      </div>
      {state !== 'upcoming' && <Badge tone={state === 'overdue' ? 'red' : 'amber'}>{state === 'overdue' ? 'Overdue' : 'Today'}</Badge>}
      <div className="flex items-center gap-0.5">
        {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="icon-act" aria-label={`WhatsApp ${lead.name}`} title="WhatsApp"><MessageCircle size={15} /></a>}
        {lead.email && <a href={`mailto:${lead.email}`} className="icon-act" aria-label={`Email ${lead.name}`} title="Email"><Mail size={15} /></a>}
        {state !== 'upcoming' && <button type="button" onClick={() => onLater(lead)} className="act" title="Move this follow-up to tomorrow">Tomorrow</button>}
      </div>
    </li>
  )
}

export default function AdminToday() {
  const { displayName } = useAuth()
  const [d, setD] = useState(null)
  const [activity, setActivity] = useState(null)
  const [signups, setSignups] = useState(null)
  const [error, setError] = useState('')
  const [allPriorities, setAllPriorities] = useState(false)
  const [toast, showToast] = useToast()

  const load = () => {
    setError('')
    return Promise.all([listLeads(), listClients(), listMeetings(), listPayments(), listRetainers(), listDocuments(), listProjects()])
      .then(([leads, clients, meetings, payments, retainers, docs, projects]) => setD({ leads, clients, meetings, payments, retainers, docs, projects }))
      .catch(e => setError(e.message))
  }

  useEffect(() => {
    load()
    listRecentActivity(12).then(setActivity).catch(() => setActivity([]))
    // Tool sign-ups come from the admin-stats function (it only answers www.vikku.in); the page works without them.
    getAdminOverview().then(o => setSignups((o.signupsByDay || []).slice(-7).reduce((n, x) => n + x.count, 0))).catch(() => {})
  }, [])

  const today = istDay()
  const v = useMemo(() => d && buildView(d, today), [d, today])

  const later = async (lead) => {
    const before = lead.next_follow_up
    try {
      await updateLead(lead.id, { next_follow_up: plusDays(today, 1) })
      await load()
      showToast({ text: `${lead.name} moved to tomorrow`, undo: async () => { await updateLead(lead.id, { next_follow_up: before }); load() } })
    } catch (e) { setError(e.message) }
  }

  const hour = Number(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', hour12: false, timeZone: IST }))
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const first = displayName?.split(' ')[0]
  const fu = v?.followUps
  const fuCount = fu ? fu.overdue.length + fu.today.length : 0
  const shown = v ? (allPriorities ? v.priorities : v.priorities.slice(0, 7)) : []

  return (
    <AdminLayout>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] leading-8 font-semibold tracking-tight text-slate-900">{greeting}{first ? `, ${first}` : ''}.</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Your business at a glance · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: IST })}
          </p>
        </div>
        <Menu width="w-52" trigger={({ open, toggle }) => (
          <button type="button" onClick={toggle} aria-haspopup="menu" aria-expanded={open}
            className="btn-primary inline-flex items-center gap-1.5 h-9 rounded-lg px-3.5 text-[13px]">
            <Plus size={15} /> Create new <ChevronDown size={14} className="opacity-80" />
          </button>
        )}>
          {CREATE.map(c => <MenuItem key={c.to} icon={c.icon} to={c.to}>{c.label}</MenuItem>)}
        </Menu>
      </div>

      {error && (
        <div role="alert" className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          Couldn't load the CRM: {error}
          <button type="button" onClick={load} className="ml-auto inline-flex items-center gap-1 font-medium hover:underline"><RefreshCw size={13} /> Retry</button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {!v ? [0, 1, 2, 3].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5"><Skeleton className="h-4 w-24" /><Skeleton className="mt-3 h-8 w-32" /><Skeleton className="mt-3 h-3 w-40" /></div>
        )) : (
          <>
            <KpiCard to="/admin/crm/leads" label="Open pipeline" value={moneyText(v.pipeline.pipeline)}
              sub={`${v.pipeline.open} open lead${v.pipeline.open === 1 ? '' : 's'} · ${v.pipeline.winRate}% won this month`} />
            <KpiCard to="/admin/crm/payments" label={`Revenue · ${new Date().toLocaleDateString('en-IN', { month: 'short', timeZone: IST })}`} value={moneyText(v.revenue)}
              spark={<Sparkline values={v.revenueByMonth} label="Rupee payments received, last 6 months" />}
              sub={`${v.paidThisMonth.length} payment${v.paidThisMonth.length === 1 ? '' : 's'} received${v.pendingCount ? ` · ${moneyText(v.pending)} pending` : ''}`} />
            <KpiCard to="/admin/crm/leads" label="New leads · 7d" value={v.newLeads}
              spark={<Sparkline values={v.leadsByWeek} label="New leads per week, last 8 weeks" />}
              trend={<Trend now={v.newLeads} before={v.prevLeads} />} />
            <KpiCard to="/admin/crm/projects" label="Active projects" value={v.activeProjects}
              sub={`${v.ongoing} ongoing · ${v.dueSoon} due in the next 14 days`} />
          </>
        )}
      </div>
      {v && (
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-slate-500">
          <span>Retainers <b className="font-medium text-slate-700">{moneyText(v.mrr)}</b>/month</span>
          <span>Quotes awaiting reply <b className="font-medium text-slate-700">{v.quotesWaiting}</b></span>
          <span>Tool sign-ups, 7 days <b className="font-medium text-slate-700">{signups ?? '—'}</b></span>
        </p>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Panel className="xl:col-span-3" title="Today's priorities" count={v?.priorities.length}
          action={v && v.priorities.length > 7 && (
            <button type="button" onClick={() => setAllPriorities(a => !a)} className="text-[13px] font-medium text-slate-500 hover:text-orange-700 rounded">
              {allPriorities ? 'Show fewer' : `Show all ${v.priorities.length}`}
            </button>
          )}>
          {!v ? <ListSkeleton /> : !v.priorities.length ? (
            <EmptyState icon={CircleCheckBig} title="Nothing needs you right now"
              action={<Link to="/admin/crm/meetings?new=1" className="act">Schedule a meeting</Link>}>
              No meetings in the next two days, overdue payments, waiting quotes or deadlines this week.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-slate-100">{shown.map(p => <PriorityRow key={p.key} p={p} />)}</ul>
          )}
        </Panel>

        <Panel className="xl:col-span-2" title="Follow-ups" count={fuCount} action={<ViewAll to="/admin/crm/leads?view=followups" />}>
          {!v ? <ListSkeleton /> : !(fu.overdue.length + fu.today.length + fu.upcoming.length) ? (
            <EmptyState icon={CalendarClock} title="No follow-ups this week"
              action={<Link to="/admin/crm/leads" className="act">Open leads</Link>}>
              Set a follow-up date on a lead and it shows up here.
            </EmptyState>
          ) : (
            [['overdue', 'Overdue'], ['today', 'Today'], ['upcoming', 'Next 7 days']].map(([key, label]) => fu[key].length > 0 && (
              <div key={key}>
                <p className="px-5 pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
                <ul className="divide-y divide-slate-100">
                  {fu[key].map(l => <FollowUpRow key={l.id} lead={l} state={key} today={today} onLater={later} />)}
                </ul>
              </div>
            ))
          )}
        </Panel>
      </div>

      <Panel className="mt-6" title="Recent activity" action={<ViewAll to="/admin/crm/leads">Open CRM</ViewAll>}>
        {!activity || !v ? <ListSkeleton rows={4} /> : !activity.length ? (
          <EmptyState icon={ArrowRightLeft} title="No CRM activity yet">New leads, stage changes, payments, quotes and meetings appear here as they happen.</EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100">
            {activity.map(a => {
              const Icon = ACTIVITY_ICON[a.kind] || StickyNote
              const client = a.client_id && v.clients[a.client_id], lead = a.lead_id && v.leads[a.lead_id]
              const record = client ? { name: client.name, to: `/admin/crm/clients/${client.id}` } : lead ? { name: lead.name, to: `/admin/crm/leads?lead=${lead.id}` } : null
              const text = a.kind === 'stage_change' && a.body?.includes('→') ? `Moved to ${stageLabel(a.body.split('→')[1].trim())}` : a.body
              return (
                <li key={a.id} className="flex items-center gap-3 px-5 py-2.5">
                  <Icon size={15} className="flex-none text-slate-400" />
                  <p className="min-w-0 flex-1 truncate text-[13px] text-slate-700">
                    {record && <Link to={record.to} className="font-medium text-slate-900 hover:text-orange-700 rounded">{record.name}</Link>}
                    {record && <span className="text-slate-300"> · </span>}{text}
                  </p>
                  <time dateTime={a.created_at} className="flex-none text-[12px] text-slate-400 tabular-nums">{ago(a.created_at)}</time>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      {toast}
    </AdminLayout>
  )
}

function ListSkeleton({ rows = 3 }) {
  return (
    <div className="px-5 py-4 space-y-4">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3"><Skeleton className="h-8 w-8" /><div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-2/3" /><Skeleton className="h-3 w-1/3" /></div></div>
      ))}
    </div>
  )
}
