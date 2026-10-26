import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ChevronRight } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import ClientForm from './ClientForm'
import { listClients } from '../../../lib/crmService'

export default function CrmClients() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('active')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    listClients().then(setClients).catch(e => setError(e.message)).finally(() => setLoading(false))
  }, [])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return clients.filter(c => (!status || c.status === status) &&
      (!q || [c.name, c.company, c.phone, c.email, c.city].some(v => v?.toLowerCase().includes(q))))
  }, [clients, query, status])

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="mr-auto">
          <h1 className="font-display font-bold text-lg text-white">Clients</h1>
          <p className="text-xs text-white/40">{clients.filter(c => c.status === 'active').length} active · {clients.length} total</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-xl">
          <Plus size={13} /> New client
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 glass rounded-xl px-3">
          <Search size={13} className="text-white/30" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, company, phone, email…"
            className="flex-1 bg-transparent py-2 text-sm text-white placeholder-white/30 focus:outline-none" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="glass rounded-xl px-3 py-2 text-sm text-white bg-transparent focus:outline-none">
          <option value="active" className="bg-black">Active</option>
          <option value="past" className="bg-black">Past</option>
          <option value="" className="bg-black">All</option>
        </select>
      </div>

      {error && <div className="text-sm text-red-500 mb-3">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>
      ) : visible.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-sm text-white/50">{clients.length ? 'No clients match your search.' : 'No clients yet.'}</p>
          {!clients.length && <p className="text-xs text-white/30 mt-1">Convert a won lead, or add a client directly.</p>}
        </div>
      ) : (
        <div className="glass rounded-2xl divide-y divide-black/[0.05] overflow-hidden">
          {visible.map(c => (
            <button key={c.id} onClick={() => navigate(`/admin/crm/clients/${c.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors">
              <span className="w-9 h-9 rounded-full bg-orange-50 text-orange-600 font-semibold text-sm flex items-center justify-center flex-shrink-0">
                {c.name.trim()[0]?.toUpperCase()}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-white truncate">{c.name}{c.company ? <span className="text-white/40 font-normal"> · {c.company}</span> : null}</span>
                <span className="block text-[11px] text-white/40 truncate">{[c.phone, c.email, c.city].filter(Boolean).join(' · ') || 'No contact details'}</span>
              </span>
              <span className="hidden sm:block text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/50">{c.currency}</span>
              <ChevronRight size={14} className="text-white/30 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {adding && <ClientForm onClose={() => setAdding(false)} onSaved={(c) => navigate(`/admin/crm/clients/${c.id}`)} />}
    </AdminLayout>
  )
}
