import { useEffect, useState } from 'react'
import { Megaphone, Trash2, RefreshCw } from 'lucide-react'
import AdminLayout from './AdminLayout'
import { Badge, EmptyState, PageHead, Skeleton } from './ui'
import {
  getAdminAnnouncements,
  adminCreateAnnouncement,
  adminToggleAnnouncement,
  adminDeleteAnnouncement,
} from '../../lib/adminService'

const TARGET_LABELS = { all: 'All Users', pro: 'Pro Only', free: 'Free Only' }

function fmt(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminAnnouncements() {
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState({ title: '', body: '', target: 'all', expires_at: '' })

  const load = async () => {
    setLoading(true); setError('')
    try {
      const d = await getAdminAnnouncements()
      setList(d.announcements || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) return
    setSaving(true)
    try {
      await adminCreateAnnouncement({
        title: form.title.trim(),
        body: form.body.trim(),
        target: form.target,
        expires_at: form.expires_at || null,
      })
      setForm({ title: '', body: '', target: 'all', expires_at: '' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id, active) => {
    setList(l => l.map(a => a.id === id ? { ...a, active: !active } : a))
    try { await adminToggleAnnouncement(id, !active) }
    catch { setList(l => l.map(a => a.id === id ? { ...a, active } : a)) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return
    setList(l => l.filter(a => a.id !== id))
    try { await adminDeleteAnnouncement(id) }
    catch (err) { setError(err.message); load() }
  }

  return (
    <AdminLayout>
      <PageHead title="Announcements" />

      <section className="card mb-4">
        <header className="card-head"><h2>New Announcement</h2></header>
        <form onSubmit={handleCreate} className="space-y-3 p-4">
          {error && <p role="alert" className="text-[12.5px] text-[var(--red)]">{error}</p>}
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            aria-label="Title"
            className="input"
            required
          />
          <textarea
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            placeholder="Body message…"
            aria-label="Body message"
            rows={3}
            className="input resize-none"
            required
          />
          <div className="flex flex-wrap gap-3">
            <select
              value={form.target}
              onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
              aria-label="Audience"
              className="input !w-auto"
            >
              <option value="all">All Users</option>
              <option value="pro">Pro Only</option>
              <option value="free">Free Only</option>
            </select>
            <input
              type="date"
              value={form.expires_at}
              onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
              className="input flex-1 min-w-[160px]"
              title="Expires at (optional)"
              aria-label="Expires at (optional)"
            />
            <button type="submit" disabled={saving} className="btn btn-primary h-9">
              {saving ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <header className="card-head">
          <h2>Announcements</h2>
          <span className="count">{list.length}</span>
          <div className="right">
            <button onClick={load} disabled={loading} className="btn btn-ghost btn-sm text-slate-600">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </header>
        {loading && !list.length ? (
          <div className="p-4 space-y-4">{[0, 1].map(i => <div key={i} className="space-y-2"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-3/4" /></div>)}</div>
        ) : list.length === 0 ? (
          <EmptyState icon={Megaphone} title="No announcements yet" />
        ) : (
          <ul className="divide-y divide-slate-200">
            {list.map(a => (
              <li key={a.id} className="px-4 py-3.5 flex gap-4 items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[14px] font-medium text-slate-900">{a.title}</span>
                    <Badge tone={a.active ? 'green' : 'slate'}>{a.active ? 'Live' : 'Hidden'}</Badge>
                    <Badge tone="blue">{TARGET_LABELS[a.target] || a.target}</Badge>
                    {a.expires_at && <span className="text-[12px] text-slate-500 tabular-nums">expires {fmt(a.expires_at)}</span>}
                  </div>
                  <p className="text-[13px] text-slate-600 line-clamp-2">{a.body}</p>
                  <p className="text-[12px] text-slate-500 mt-1 tabular-nums">{fmt(a.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <label className="switch" title={a.active ? 'Hide' : 'Show'}>
                    <input type="checkbox" checked={!!a.active} onChange={() => handleToggle(a.id, a.active)} aria-label={`${a.active ? 'Hide' : 'Show'} "${a.title}"`} />
                    <span aria-hidden="true" />
                  </label>
                  <button onClick={() => handleDelete(a.id)} className="icon-act hover:!text-[var(--red)] hover:!bg-[var(--red-bg)]" aria-label={`Delete "${a.title}"`} title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminLayout>
  )
}
