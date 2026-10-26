import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Pencil, Trash2, MessageCircle, Globe2 } from 'lucide-react'
import AdminLayout from '../AdminLayout'
import ClientForm from './ClientForm'
import Timeline from './Timeline'
import { deleteClient, getClient, whatsappNumber } from '../../../lib/crmService'

export default function CrmClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)

  useEffect(() => { getClient(id).then(setClient).catch(e => setError(e.message)) }, [id])

  const remove = async () => {
    if (!confirm(`Delete the client "${client.name}"? Their timeline is deleted too; the original lead stays.`)) return
    try { await deleteClient(client.id); navigate('/admin/crm/clients') }
    catch (err) { setError(err.message) }
  }

  const wa = whatsappNumber(client?.phone)

  return (
    <AdminLayout>
      <button onClick={() => navigate('/admin/crm/clients')} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white mb-4">
        <ArrowLeft size={13} /> Back to clients
      </button>

      {error && <div className="text-sm text-red-500 mb-3">{error}</div>}
      {!client ? (
        !error && <div className="flex items-center justify-center h-32"><div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /></div>
      ) : (
        <>
          <div className="glass rounded-2xl p-5 mb-5">
            <div className="flex flex-wrap items-start gap-4">
              <span className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 font-semibold text-xl flex items-center justify-center flex-shrink-0">
                {client.name.trim()[0]?.toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <h1 className="font-display font-bold text-lg text-white">{client.name}</h1>
                {client.company && <p className="text-sm text-white/50">{client.company}</p>}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
                  {client.phone && <span className="flex items-center gap-1.5"><Phone size={12} /> {client.phone}</span>}
                  {client.email && <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 hover:text-white"><Mail size={12} /> {client.email}</a>}
                  {(client.city || client.country) && <span className="flex items-center gap-1.5"><MapPin size={12} /> {[client.city, client.country].filter(Boolean).join(', ')}</span>}
                  <span className="flex items-center gap-1.5"><Globe2 size={12} /> Billed in {client.currency}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {wa && (
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-green-50 text-green-700">
                    <MessageCircle size={12} /> WhatsApp
                  </a>
                )}
                <button onClick={() => setEditing(true)} className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.06]" aria-label="Edit client"><Pencil size={14} /></button>
                <button onClick={remove} className="p-2 rounded-xl text-white/40 hover:text-red-500 hover:bg-red-50" aria-label="Delete client"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-black/[0.05] flex flex-wrap gap-2 text-[11px]">
              <span className={`px-2 py-0.5 rounded-full ${client.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-white/[0.06] text-white/50'}`}>{client.status === 'active' ? 'Active' : 'Past'}</span>
              {client.lead_id && <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">Converted from a lead</span>}
              <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/50">Client since {new Date(client.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <section className="glass rounded-2xl p-5 lg:col-span-2">
              <h2 className="text-[10px] text-white/40 uppercase tracking-widest mb-4">Timeline</h2>
              <Timeline clientId={client.id} leadId={client.lead_id} />
            </section>
            <section className="glass rounded-2xl p-5 space-y-3 text-xs h-fit">
              <h2 className="text-[10px] text-white/40 uppercase tracking-widest">Details</h2>
              <p><span className="text-white/40">GST number</span><br /><span className="text-white">{client.gst_number || 'Not added'}</span></p>
              <p><span className="text-white/40">Address</span><br /><span className="text-white">{client.address || 'Not added'}</span></p>
              <p><span className="text-white/40">Notes</span><br /><span className="text-white whitespace-pre-wrap">{client.notes || 'No notes'}</span></p>
            </section>
          </div>
        </>
      )}

      {editing && <ClientForm client={client} onClose={() => setEditing(false)} onSaved={(c) => { setClient(c); setEditing(false) }} />}
    </AdminLayout>
  )
}
