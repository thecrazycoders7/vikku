import { useEffect, useState } from 'react'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { RefreshCw, Activity } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { Badge, DataTable, EmptyState, ErrorState, PageHead } from './ui'
import { getAdminActivity } from '../../lib/adminService'

const TYPE_META = {
  signup:    { tone: 'green',  label: 'Signed up' },
  upgrade:   { tone: 'violet', label: 'Upgraded' },
  project:   { tone: 'blue',   label: 'Created project' },
  payment:   { tone: 'green',  label: 'Payment received' },
  signin:    { tone: 'slate',  label: 'Signed in' },
}
const COLUMNS = [
  { key: 'type', label: 'Event', render: ev => { const m = TYPE_META[ev.type] || TYPE_META.signin; return <Badge tone={m.tone}>{m.label}</Badge> } },
  { key: 'email', label: 'User', sort: ev => ev.email?.toLowerCase(), render: ev => <span className="font-mono text-[12.5px] text-slate-900">{ev.email || 'Unknown'}</span> },
  { key: 'detail', label: 'Detail', className: 'max-md:hidden', render: ev => <span className="block max-w-[360px] truncate text-slate-600">{ev.detail || '—'}</span> },
  { key: 'when', label: 'When', sort: ev => ev.timestamp, render: ev => <time dateTime={ev.timestamp} title={ev.timestamp && new Date(ev.timestamp).toLocaleString('en-IN')} className="text-slate-500">{timeAgo(ev.timestamp)}</time> },
]
const TYPE_FILTER = { key: 'type', label: 'Event', all: 'All events', options: Object.entries(TYPE_META).map(([value, m]) => ({ value, label: m.label })), test: (ev, v) => (TYPE_META[ev.type] ? ev.type : 'signin') === v }

function timeAgo(dateStr) {
  if (!dateStr) return '-'
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function AdminActivity() {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const d = await getAdminActivity()
      setEvents(d.events || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useAutoRefresh(load, 30000)

  return (
    <AdminLayout>
      <PageHead title="Activity Feed" sub="Last 50 actions across all users">
        <button onClick={load} disabled={loading} className="btn btn-ghost text-slate-600">
          <RefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </PageHead>

      <div className="card overflow-hidden">
        {error && !events.length ? <ErrorState title="Couldn't load activity" onRetry={load}>{error}</ErrorState> : (
          <DataTable rows={events} columns={COLUMNS} rowKey={ev => `${ev.type}-${ev.email}-${ev.timestamp}`} loading={loading && !events.length}
            search={ev => [ev.email, ev.detail].filter(Boolean).join(' ')} searchLabel="Search email or detail" filters={[TYPE_FILTER]}
            initialSort={{ key: 'when', dir: 'desc' }} empty={<EmptyState icon={Activity} title="No activity yet" />} />
        )}
      </div>
    </AdminLayout>
  )
}
