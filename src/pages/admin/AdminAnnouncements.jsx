import { useEffect, useState } from 'react'
import { Megaphone, Trash2, ToggleLeft, ToggleRight, RefreshCw, Plus } from 'lucide-react'
import AdminLayout from './AdminLayout'
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
    <AdminLayout title="Announcements">
      {/* Create form */}
      <div className="glass rounded-2xl p-5 mb-5">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Plus size={11} /> New Announcement
        </p>
        {error && <div className="text-sm text-red-400 mb-3">{error}</div>}
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none"
            required
          />
          <textarea
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            placeholder="Body message…"
            rows={3}
            className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none resize-none"
            required
          />
          <div className="flex gap-3">
            <select
              value={form.target}
              onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
              className="glass rounded-xl px-3 py-2 text-sm text-white focus:outline-none bg-transparent"
            >
              <option value="all" className="bg-black">All Users</option>
              <option value="pro" className="bg-black">Pro Only</option>
              <option value="free" className="bg-black">Free Only</option>
            </select>
            <input
              type="date"
              value={form.expires_at}
              onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
              className="glass rounded-xl px-3 py-2 text-sm text-white focus:outline-none bg-transparent flex-1"
              title="Expires at (optional)"
            />
            <button
              type="submit"
              disabled={saving}
              className="bg-white text-black text-sm font-semibold px-5 py-2 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-white/40">{list.length} announcement{list.length !== 1 ? 's' : ''}</p>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && !list.length ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-white/30">No announcements yet</div>
      ) : (
        <div className="space-y-3">
          {list.map(a => (
            <div key={a.id} className="glass rounded-2xl p-4 flex gap-4 items-start">
              <Megaphone size={15} className={`mt-0.5 flex-shrink-0 ${a.active ? 'text-orange-400' : 'text-white/20'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium text-white">{a.title}</span>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${a.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/30'}`}>
                    {a.active ? 'Live' : 'Hidden'}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40">
                    {TARGET_LABELS[a.target] || a.target}
                  </span>
                  {a.expires_at && (
                    <span className="text-[9px] text-white/30">expires {fmt(a.expires_at)}</span>
                  )}
                </div>
                <p className="text-xs text-white/50 line-clamp-2">{a.body}</p>
                <p className="text-[10px] text-white/25 mt-1">{fmt(a.created_at)}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleToggle(a.id, a.active)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.07] transition-colors text-white/40 hover:text-white"
                  title={a.active ? 'Hide' : 'Show'}
                >
                  {a.active ? <ToggleRight size={15} className="text-green-400" /> : <ToggleLeft size={15} />}
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-white/30 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
