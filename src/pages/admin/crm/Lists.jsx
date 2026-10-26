import { CheckCircle2, Trash2, Pencil } from 'lucide-react'
import { PAYMENT_KINDS, PAYMENT_METHODS, formatMoney, isoDay, labelOf, moneyText } from '../../../lib/crmService'

export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

export function MoneyTile({ label, sums, tone = 'text-white', hint }) {
  return (
    <div className="glass rounded-2xl p-4 min-w-0">
      <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
      <p className={`mt-1 font-display font-bold text-lg break-words ${tone}`}>{typeof sums === 'object' ? moneyText(sums) : sums}</p>
      {hint && <p className="text-[10px] text-white/30 mt-0.5">{hint}</p>}
    </div>
  )
}

// Payment rows with mark-as-received, edit and delete.
export function PaymentRows({ payments, clientsById = {}, projectsById = {}, onReceived, onEdit, onDelete, showClient }) {
  const today = isoDay()
  if (!payments.length) return <p className="text-xs text-white/30 py-4">No payments yet.</p>
  return (
    <div className="divide-y divide-black/[0.05]">
      {payments.map(p => {
        const overdue = p.status === 'pending' && p.due_on && p.due_on < today
        return (
          <div key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">{formatMoney(p.amount, p.currency)}
                <span className={`ml-2 text-[10px] font-medium px-2 py-0.5 rounded-full ${p.status === 'received' ? 'bg-emerald-50 text-emerald-700' : overdue ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                  {p.status === 'received' ? 'Received' : overdue ? 'Overdue' : 'Pending'}
                </span>
              </p>
              <p className="text-[11px] text-white/40 truncate">
                {[showClient && clientsById[p.client_id]?.name, projectsById[p.project_id]?.name, labelOf(PAYMENT_KINDS, p.kind), p.method && labelOf(PAYMENT_METHODS, p.method), p.reference].filter(Boolean).join(' · ')}
              </p>
            </div>
            <p className="text-[11px] text-white/50">{p.status === 'received' ? `Received ${fmtDate(p.paid_on)}` : p.due_on ? `Due ${fmtDate(p.due_on)}` : 'No due date'}</p>
            <div className="flex items-center gap-1">
              {p.status === 'pending' && onReceived && (
                <button onClick={() => onReceived(p)} className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700" title="Mark as received today">
                  <CheckCircle2 size={12} /> Received
                </button>
              )}
              {onEdit && <button onClick={() => onEdit(p)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06]" aria-label="Edit payment"><Pencil size={13} /></button>}
              {onDelete && <button onClick={() => onDelete(p)} className="p-1.5 rounded-lg text-white/30 hover:text-red-500 hover:bg-red-50" aria-label="Delete payment"><Trash2 size={13} /></button>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const RETAINER_TONE = { active: 'bg-emerald-50 text-emerald-700', paused: 'bg-amber-50 text-amber-700', ended: 'bg-white/[0.06] text-white/50' }

// Retainer rows; "Record month" logs this month's retainer payment and moves the next billing date on.
export function RetainerRows({ retainers, clientsById = {}, onRecord, onEdit, showClient }) {
  if (!retainers.length) return <p className="text-xs text-white/30 py-4">No retainers yet.</p>
  return (
    <div className="divide-y divide-black/[0.05]">
      {retainers.map(r => (
        <div key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">{formatMoney(r.amount, r.currency)}<span className="text-white/40 font-normal">/month</span>
              <span className={`ml-2 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${RETAINER_TONE[r.status]}`}>{r.status}</span>
            </p>
            <p className="text-[11px] text-white/40 truncate">{[showClient && clientsById[r.client_id]?.name, r.title].filter(Boolean).join(' · ')}</p>
          </div>
          <p className="text-[11px] text-white/50">{r.next_billing_date ? `Next bill ${fmtDate(r.next_billing_date)}` : 'No billing date'}</p>
          <div className="flex items-center gap-1">
            {r.status === 'active' && onRecord && (
              <button onClick={() => onRecord(r)} className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-700">Record month</button>
            )}
            {onEdit && <button onClick={() => onEdit(r)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06]" aria-label="Edit retainer"><Pencil size={13} /></button>}
          </div>
        </div>
      ))}
    </div>
  )
}
