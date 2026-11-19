import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import ClientForm from './ClientForm'
import { fmtDate } from './Lists'
import { Badge, DataTable, EmptyState, ErrorState, PageHead } from '../ui'
import useOpenOnParam from '../../../hooks/useOpenOnParam'
import { listClients } from '../../../lib/crmService'

const COLUMNS = [
  { key: 'name', label: 'Client', sort: c => c.name?.toLowerCase(), render: c => (
    <span className="flex items-center gap-3 min-w-0">
      <span aria-hidden="true" className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-semibold text-[13px] flex items-center justify-center flex-shrink-0">{c.name.trim()[0]?.toUpperCase()}</span>
      <span className="min-w-0">
        <span className="block font-medium text-slate-900 truncate max-w-[260px]">{c.name}</span>
        {c.company && <span className="block text-[12px] text-slate-500 truncate max-w-[260px]">{c.company}</span>}
      </span>
    </span>
  ) },
  { key: 'contact', label: 'Contact', className: 'max-md:hidden', render: c => <span className="text-slate-600">{[c.phone, c.email].filter(Boolean).join(' · ') || 'No contact details'}</span> },
  { key: 'city', label: 'City', className: 'max-lg:hidden', render: c => <span className="text-slate-600">{c.city || '—'}</span> },
  { key: 'status', label: 'Status', render: c => <Badge tone={c.status === 'active' ? 'green' : 'slate'}>{c.status === 'active' ? 'Active' : 'Past'}</Badge> },
  { key: 'currency', label: 'Currency', className: 'max-sm:hidden', render: c => <span className="text-slate-600">{c.currency}</span> },
  { key: 'added', label: 'Added', className: 'max-sm:hidden', sort: c => c.created_at, render: c => <span className="text-slate-600 tabular-nums">{fmtDate(c.created_at)}</span> },
]
const STATUS = { key: 'status', label: 'Status', all: 'All clients', options: [{ value: 'active', label: 'Active' }, { value: 'past', label: 'Past' }], test: (c, v) => c.status === v }

export default function CrmClients() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  useOpenOnParam('new', () => setAdding(true))

  const load = () => {
    setLoading(true); setError('')
    listClients().then(setClients).catch(e => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  return (
    <AdminLayout>
      <PageHead title="Clients" sub={`${clients.filter(c => c.status === 'active').length} active · ${clients.length} total`}>
        <button onClick={() => setAdding(true)} className="btn btn-primary"><Plus /> New client</button>
      </PageHead>

      <div className="card overflow-hidden">
        {error ? <ErrorState title="Couldn't load clients" onRetry={load}>{error}</ErrorState> : (
          <DataTable rows={clients} columns={COLUMNS} loading={loading}
            search={c => [c.name, c.company, c.phone, c.email, c.city].filter(Boolean).join(' ')} searchLabel="Search name, company, phone, email"
            filters={[STATUS]} initialFilters={{ status: 'active' }} initialSort={{ key: 'name', dir: 'asc' }}
            onRowClick={c => navigate(`/admin/crm/clients/${c.id}`)}
            empty={<EmptyState icon={Users} title="No clients yet">Convert a won lead, or add a client directly.</EmptyState>} />
        )}
      </div>

      {adding && <ClientForm onClose={() => setAdding(false)} onSaved={(c) => navigate(`/admin/crm/clients/${c.id}`)} />}
    </AdminLayout>
  )
}
