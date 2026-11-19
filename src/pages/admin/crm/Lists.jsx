import { CheckCircle2, Trash2, Pencil } from 'lucide-react'
import { PAYMENT_KINDS, PAYMENT_METHODS, formatMoney, isoDay, labelOf, moneyText } from '../../../lib/crmService'
import { Badge } from '../ui'

export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

export function MoneyTile({ label, sums, tone = '', hint }) {
  return (
    <div className="card kpi min-w-0">
      <p className="kpi-label">{label}</p>
      <p className={`kpi-value break-words ${tone}`}>{typeof sums === 'object' ? moneyText(sums) : sums}</p>
      {hint && <p className="kpi-foot">{hint}</p>}
    </div>
  )
}

// Payment rows with mark-as-received, edit and delete.
export function PaymentRows({ payments, clientsById = {}, projectsById = {}, onReceived, onEdit, onDelete, showClient }) {
  const today = isoDay()
  if (!payments.length) return <p className="text-[13px] text-slate-500 py-4">No payments yet.</p>
  return (
    <div className="divide-y divide-slate-200">
      {payments.map(p => {
        const overdue = p.status === 'pending' && p.due_on && p.due_on < today
        return (
          <div key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[14px] font-semibold text-slate-900 tabular-nums">{formatMoney(p.amount, p.currency)}
                <Badge tone={p.status === 'received' ? 'green' : overdue ? 'red' : 'amber'}>{p.status === 'received' ? 'Received' : overdue ? 'Overdue' : 'Pending'}</Badge>
              </p>
              <p className="text-[12px] text-slate-500 truncate">
                {[showClient && clientsById[p.client_id]?.name, projectsById[p.project_id]?.name, labelOf(PAYMENT_KINDS, p.kind), p.method && labelOf(PAYMENT_METHODS, p.method), p.reference].filter(Boolean).join(' · ')}
              </p>
            </div>
            <p className="text-[12px] text-slate-500 tabular-nums">{p.status === 'received' ? `Received ${fmtDate(p.paid_on)}` : p.due_on ? `Due ${fmtDate(p.due_on)}` : 'No due date'}</p>
            <div className="flex items-center gap-1">
              {p.status === 'pending' && onReceived && (
                <button onClick={() => onReceived(p)} className="act" title="Mark as received today">
                  <CheckCircle2 size={14} /> Received
                </button>
              )}
              {onEdit && <button onClick={() => onEdit(p)} className="icon-act" aria-label="Edit payment"><Pencil size={15} /></button>}
              {onDelete && <button onClick={() => onDelete(p)} className="icon-act hover:!text-[var(--red)] hover:!bg-[var(--red-bg)]" aria-label="Delete payment"><Trash2 size={15} /></button>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const RETAINER_TONE = { active: 'green', paused: 'amber', ended: 'slate' }

// Retainer rows; "Record month" logs this month's retainer payment and moves the next billing date on.
export function RetainerRows({ retainers, clientsById = {}, onRecord, onEdit, showClient }) {
  if (!retainers.length) return <p className="text-[13px] text-slate-500 py-4">No retainers yet.</p>
  return (
    <div className="divide-y divide-slate-200">
      {retainers.map(r => (
        <div key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[14px] font-semibold text-slate-900 tabular-nums"><span>{formatMoney(r.amount, r.currency)}<span className="text-slate-500 font-normal">/month</span></span>
              <Badge tone={RETAINER_TONE[r.status]}><span className="capitalize">{r.status}</span></Badge>
            </p>
            <p className="text-[12px] text-slate-500 truncate">{[showClient && clientsById[r.client_id]?.name, r.title].filter(Boolean).join(' · ')}</p>
          </div>
          <p className="text-[12px] text-slate-500 tabular-nums">{r.next_billing_date ? `Next bill ${fmtDate(r.next_billing_date)}` : 'No billing date'}</p>
          <div className="flex items-center gap-1">
            {r.status === 'active' && onRecord && (
              <button onClick={() => onRecord(r)} className="act">Record month</button>
            )}
            {onEdit && <button onClick={() => onEdit(r)} className="icon-act" aria-label="Edit retainer"><Pencil size={15} /></button>}
          </div>
        </div>
      ))}
    </div>
  )
}
