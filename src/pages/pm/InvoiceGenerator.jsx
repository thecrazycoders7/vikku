import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, Plus, Trash2, Save, History, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getProject, getMilestones, getProjectTimeLogs, saveInvoice, getInvoices } from '../../lib/pmService'
import AppHeader from '../../components/AppHeader'

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function fmtMins(m) {
  if (!m) return '0h'
  const h = Math.floor(m / 60)
  const mins = m % 60
  if (h === 0) return `${mins}m`
  if (mins === 0) return `${h}h`
  return `${h}h ${mins}m`
}

export default function InvoiceGenerator() {
  const { id } = useParams()
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [timeLogs, setTimeLogs] = useState([])
  const [fetching, setFetching] = useState(true)

  // Invoice fields
  const [invoiceNum, setInvoiceNum] = useState(`INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`)
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [agencyName, setAgencyName] = useState('Vikku Agency')
  const [currency, setCurrency] = useState('INR')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState([])
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [invoiceHistory, setInvoiceHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (!loading && !user) navigate('/login')
  }, [user, loading, navigate])

  useEffect(() => {
    if (!user || !id) return
    async function load() {
      const p = await getProject(id)
      if (!p) { navigate('/pm/dashboard'); return }
      const [m, tl] = await Promise.all([
        getMilestones(p.id),
        getProjectTimeLogs(p.id),
      ])
      setProject(p)
      setMilestones(m)
      setTimeLogs(tl)
      setClientName(p.client_name || '')
      setClientEmail(p.client_email || '')
      // Pre-populate lines from completed milestones
      const initialLines = m.filter((ms) => ms.completed).map((ms) => ({
        id: ms.id,
        desc: ms.title,
        qty: 1,
        rate: '',
        unit: 'flat',
      }))
      if (initialLines.length === 0) {
        initialLines.push({ id: 'line1', desc: p.name, qty: 1, rate: '', unit: 'flat' })
      }
      setLines(initialLines)
      setFetching(false)
      getInvoices(id).then(setInvoiceHistory)
    }
    load()
  }, [user, id, navigate])

  const totalMinutes = timeLogs.reduce((s, l) => s + (l.minutes || 0), 0)
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency

  const lineTotal = (line) => {
    const qty = parseFloat(line.qty) || 0
    const rate = parseFloat(line.rate) || 0
    return qty * rate
  }

  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0)
  const gst = currency === 'INR' ? subtotal * 0.18 : 0
  const total = subtotal + gst

  const fmtAmount = (n) => {
    const locale = currency === 'INR' ? 'en-IN' : 'en-US'
    return symbol + new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
  }

  const addLine = () => setLines((prev) => [...prev, { id: `line-${Date.now()}`, desc: '', qty: 1, rate: '', unit: 'flat' }])
  const removeLine = (lineId) => setLines((prev) => prev.filter((l) => l.id !== lineId))
  const updateLine = (lineId, field, value) => setLines((prev) => prev.map((l) => l.id === lineId ? { ...l, [field]: value } : l))

  const handleSave = async () => {
    setSaving(true)
    try {
      const inv = await saveInvoice({
        project_id: id,
        user_id: user.id,
        invoice_num: invoiceNum,
        issue_date: issueDate,
        due_date: dueDate || null,
        client_name: clientName,
        client_email: clientEmail,
        agency_name: agencyName,
        currency,
        lines,
        subtotal,
        gst,
        total,
        notes,
      })
      setInvoiceHistory((prev) => [inv, ...prev])
      setSavedMsg('Saved!')
      setTimeout(() => setSavedMsg(''), 2000)
    } catch (err) {
      setSavedMsg('Save failed')
      setTimeout(() => setSavedMsg(''), 2000)
    } finally {
      setSaving(false)
    }
  }

  const loadHistoryInvoice = (inv) => {
    setInvoiceNum(inv.invoice_num)
    setIssueDate(inv.issue_date)
    setDueDate(inv.due_date || '')
    setClientName(inv.client_name || '')
    setClientEmail(inv.client_email || '')
    setAgencyName(inv.agency_name || 'Vikku Agency')
    setCurrency(inv.currency || 'INR')
    setLines(inv.lines || [])
    setNotes(inv.notes || '')
    setShowHistory(false)
  }

  const handlePrint = () => {
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><title>${invoiceNum}</title>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:system-ui,sans-serif;background:#fff;color:#111;padding:40px;max-width:720px;margin:0 auto;font-size:14px}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px}
      .agency{font-size:22px;font-weight:800;color:#111}
      .invoice-meta{text-align:right}
      .invoice-num{font-size:20px;font-weight:700;color:#111}
      .meta-row{font-size:12px;color:#888;margin-top:4px}
      .parties{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px}
      .party-label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#aaa;margin-bottom:8px}
      .party-name{font-weight:600;font-size:15px;margin-bottom:4px}
      .party-detail{font-size:13px;color:#666}
      table{width:100%;border-collapse:collapse;margin-bottom:24px}
      th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#aaa;padding:8px 12px;border-bottom:2px solid #f0f0f0}
      td{padding:10px 12px;border-bottom:1px solid #f7f7f7;font-size:13px}
      .text-right{text-align:right}
      .totals{display:flex;justify-content:flex-end;margin-bottom:24px}
      .totals-box{width:220px}
      .totals-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#666;border-bottom:1px solid #f5f5f5}
      .totals-total{display:flex;justify-content:space-between;padding:10px 0;font-size:16px;font-weight:700;color:#111;border-top:2px solid #111;margin-top:4px}
      .notes{background:#f9f9f9;border-radius:8px;padding:16px;font-size:12px;color:#666;margin-bottom:24px}
      .footer{text-align:center;font-size:11px;color:#ccc;padding-top:24px;border-top:1px solid #f0f0f0}
      .badge{display:inline-block;background:#f0f0f0;border-radius:99px;padding:2px 8px;font-size:11px;color:#888;margin-top:4px}
      @media print{body{padding:20px}}
    </style></head><body>
    <div class="header">
      <div>
        <div class="agency">${escHtml(agencyName)}</div>
        <div class="meta-row">Invoice for: ${escHtml(project?.name)}</div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-num">${escHtml(invoiceNum)}</div>
        <div class="meta-row">Issue date: ${escHtml(issueDate)}</div>
        ${dueDate ? `<div class="meta-row">Due: ${escHtml(dueDate)}</div>` : ''}
      </div>
    </div>
    <div class="parties">
      <div>
        <div class="party-label">Bill From</div>
        <div class="party-name">${escHtml(agencyName)}</div>
      </div>
      <div>
        <div class="party-label">Bill To</div>
        <div class="party-name">${escHtml(clientName) || 'Client'}</div>
        ${clientEmail ? `<div class="party-detail">${escHtml(clientEmail)}</div>` : ''}
      </div>
    </div>
    <table>
      <tr><th>Description</th><th class="text-right">Qty</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr>
      ${lines.map((l) => `<tr>
        <td>${escHtml(l.desc) || '-'}</td>
        <td class="text-right">${escHtml(String(l.qty))}</td>
        <td class="text-right">${fmtAmount(parseFloat(l.rate) || 0)}</td>
        <td class="text-right">${fmtAmount(lineTotal(l))}</td>
      </tr>`).join('')}
    </table>
    <div class="totals">
      <div class="totals-box">
        <div class="totals-row"><span>Subtotal</span><span>${fmtAmount(subtotal)}</span></div>
        ${gst > 0 ? `<div class="totals-row"><span>GST (18%)</span><span>${fmtAmount(gst)}</span></div>` : ''}
        <div class="totals-total"><span>Total</span><span>${fmtAmount(total)}</span></div>
      </div>
    </div>
    ${totalMinutes > 0 ? `<div class="notes"><strong>Time tracked:</strong> ${fmtMins(totalMinutes)} logged on this project</div>` : ''}
    ${notes ? `<div class="notes">${escHtml(notes)}</div>` : ''}
    <div class="footer">Generated with Vikku PM · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    <script>window.onload=()=>window.print()</script>
    </body></html>`)
    win.document.close()
  }

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader
        breadcrumbs={[
          { label: 'Projects', href: '/pm/dashboard' },
          { label: project?.name, href: `/pm/projects/${project?.slug || id}` },
          { label: 'Invoice' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {invoiceHistory.length > 0 && (
              <button
                onClick={() => setShowHistory((v) => !v)}
                className="flex items-center gap-1.5 text-xs bg-white/[0.06] border border-white/10 text-white/60 font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <History size={13} /> History ({invoiceHistory.length})
                {showHistory ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs bg-white/[0.06] border border-white/10 text-white/60 font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-40"
            >
              <Save size={13} /> {savedMsg || (saving ? 'Saving…' : 'Save')}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs bg-white text-black font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
            >
              <Printer size={13} /> Print / Save PDF
            </button>
          </div>
        }
      />

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Invoice history */}
        {showHistory && invoiceHistory.length > 0 && (
          <div className="glass rounded-2xl p-5">
            <p className="text-xs font-semibold text-white/60 mb-3 uppercase tracking-wider">Saved Invoices</p>
            <div className="space-y-2">
              {invoiceHistory.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => loadHistoryInvoice(inv)}
                  className="w-full flex items-center justify-between glass rounded-xl px-4 py-3 hover:border-white/20 transition-all text-left"
                >
                  <div>
                    <p className="text-xs font-medium text-white">{inv.invoice_num}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{inv.client_name || 'No client'} · {inv.issue_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-white">{inv.currency === 'INR' ? '₹' : inv.currency}{Number(inv.total).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Load</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}


        {/* Invoice meta */}
        <div className="glass rounded-2xl p-6 grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-white/40 mb-1 block uppercase tracking-wider">Agency Name</label>
            <input value={agencyName} onChange={(e) => setAgencyName(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-white/40 mb-1 block uppercase tracking-wider">Invoice Number</label>
            <input value={invoiceNum} onChange={(e) => setInvoiceNum(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-white/40 mb-1 block uppercase tracking-wider">Issue Date</label>
            <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/70 outline-none focus:border-white/20 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-white/40 mb-1 block uppercase tracking-wider">Payment Due</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/70 outline-none focus:border-white/20 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-white/40 mb-1 block uppercase tracking-wider">Client Name</label>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-white/40 mb-1 block uppercase tracking-wider">Client Email</label>
            <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-colors" />
          </div>
          <div>
            <label className="text-[10px] text-white/40 mb-1 block uppercase tracking-wider">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-white/20 transition-colors">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        {/* Time logged summary */}
        {totalMinutes > 0 && (
          <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/[0.05] flex items-center justify-center">
              <span className="text-xs">⏱</span>
            </div>
            <div>
              <p className="text-xs text-white/70">{fmtMins(totalMinutes)} tracked on this project</p>
              <p className="text-[10px] text-white/30">Across {timeLogs.length} time log{timeLogs.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {/* Line items */}
        <div className="glass rounded-2xl p-6">
          <p className="text-xs font-semibold text-white/70 mb-4">Line Items</p>
          <div className="space-y-2 mb-4">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-[10px] text-white/30 uppercase tracking-wider pb-2 border-b border-white/[0.06]">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-3 text-right">Rate ({symbol})</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            {lines.map((line) => (
              <div key={line.id} className="grid grid-cols-12 gap-2 items-center group">
                <input
                  value={line.desc}
                  onChange={(e) => updateLine(line.id, 'desc', e.target.value)}
                  placeholder="Description..."
                  className="col-span-5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/20 outline-none focus:border-white/15 transition-colors"
                />
                <input
                  type="number"
                  min="0"
                  value={line.qty}
                  onChange={(e) => updateLine(line.id, 'qty', e.target.value)}
                  className="col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white text-right outline-none focus:border-white/15 transition-colors"
                />
                <input
                  type="number"
                  min="0"
                  value={line.rate}
                  onChange={(e) => updateLine(line.id, 'rate', e.target.value)}
                  placeholder="0"
                  className="col-span-3 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white text-right outline-none focus:border-white/15 transition-colors"
                />
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <span className="text-xs text-white/50">{fmtAmount(lineTotal(line))}</span>
                  <button onClick={() => removeLine(line.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addLine} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
            <Plus size={12} /> Add line item
          </button>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="glass rounded-2xl p-5 w-64 space-y-2">
            <div className="flex justify-between text-xs text-white/50">
              <span>Subtotal</span><span>{fmtAmount(subtotal)}</span>
            </div>
            {gst > 0 && (
              <div className="flex justify-between text-xs text-white/50">
                <span>GST (18%)</span><span>{fmtAmount(gst)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-white border-t border-white/[0.08] pt-2">
              <span>Total</span><span>{fmtAmount(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="glass rounded-2xl p-5">
          <label className="text-[10px] text-white/40 mb-2 block uppercase tracking-wider">Notes / Payment Terms</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Payment due within 30 days. Bank transfer: HDFC xxxxxxxx"
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-white/15 transition-colors resize-none"
          />
        </div>

        {/* Print button */}
        <div className="flex justify-end pb-8">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
          >
            <Printer size={15} /> Generate Invoice PDF
          </button>
        </div>
      </div>
    </div>
  )
}
