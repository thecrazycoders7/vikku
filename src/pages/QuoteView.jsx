import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, XCircle, Download, Clock, Mail } from 'lucide-react'
import { getSharedQuote, respondToQuote } from '../lib/quoteShare'
import { quoteTotals } from '../lib/crmUtils'
import { trapProps } from '../lib/signup'

// Public quotation page: vikku.in/q/<token>. The client reads the quote, then accepts it (typing
// their name) or declines it. Not indexed; the link itself is the only key.
const IST = 'Asia/Kolkata'
const money = (n, c) => new Intl.NumberFormat(c === 'USD' ? 'en-US' : 'en-IN', { style: 'currency', currency: c || 'INR', maximumFractionDigits: 2 }).format(Number(n) || 0)
const dateText = (d) => new Date(d.length === 10 ? `${d}T12:00:00Z` : d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: d.length === 10 ? 'UTC' : IST })
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: IST })

export default function QuoteView() {
  const { token } = useParams()
  const [q, setQ] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [mode, setMode] = useState(null) // null | 'accept' | 'decline'
  const [name, setName] = useState('')
  const [agree, setAgree] = useState(false)
  const [note, setNote] = useState('')
  const [trap, setTrap] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Quotation · Vikku'
    // Private page: switch the site's robots tag off while it's open (vercel.json also sends X-Robots-Tag).
    const robots = document.querySelector('meta[name="robots"]')
    const before = robots?.content
    if (robots) robots.content = 'noindex, nofollow'
    return () => { if (robots) robots.content = before }
  }, [])

  useEffect(() => {
    getSharedQuote(token).then(setQ).catch(e => setLoadError(e.message))
  }, [token])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const r = await respondToQuote({ token, accept: mode === 'accept', name, note, website: trap })
      setQ(prev => ({ ...prev, status: r.status, response_name: prev.response_name || name.trim(), responded_at: prev.responded_at || new Date().toISOString() }))
      setMode(null)
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  const pdf = async () => {
    const { downloadPdf } = await import('../lib/quotePdf')
    downloadPdf(q, q.party)
  }

  if (loadError) {
    return (
      <Shell>
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <XCircle size={28} className="mx-auto text-slate-400" />
          <h1 className="mt-3 text-lg font-semibold text-slate-900">Quotation not found</h1>
          <p className="mt-1 text-sm text-slate-500">{loadError} If you think this is a mistake, email <a className="text-orange-700 underline" href="mailto:connect@vikku.in">connect@vikku.in</a>.</p>
        </div>
      </Shell>
    )
  }
  if (!q) return <Shell><div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" /></Shell>

  const t = quoteTotals(q.items, q.tax_percent, q.discount)
  const expired = q.status === 'sent' && q.valid_until && q.valid_until < today()
  const open = q.status === 'sent' && !expired

  return (
    <Shell>
      {q.status === 'accepted' && (
        <Banner tone="green" icon={CheckCircle2} title="Quotation accepted — thank you!">
          Accepted by {q.response_name}{q.responded_at ? ` on ${dateText(q.responded_at)}` : ''}. We'll be in touch shortly to plan the kickoff.
        </Banner>
      )}
      {q.status === 'declined' && (
        <Banner tone="slate" icon={XCircle} title="Quotation declined">Thanks for letting us know. If anything changes, just reply to our email or write to connect@vikku.in.</Banner>
      )}
      {expired && (
        <Banner tone="amber" icon={Clock} title="This quotation has expired">It was valid until {dateText(q.valid_until)}. Email connect@vikku.in and we'll send an updated quote.</Banner>
      )}

      <article className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <header className="flex flex-wrap items-start justify-between gap-4 p-6 sm:p-8 border-b border-slate-100">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-orange-700">Quotation</p>
            <h1 className="mt-1 text-[24px] leading-8 font-semibold tracking-tight text-slate-900">{q.title}</h1>
            {q.party && <p className="mt-1 text-sm text-slate-500">Prepared for <b className="font-medium text-slate-700">{q.party.name}</b>{q.party.company ? ` · ${q.party.company}` : ''}</p>}
          </div>
          <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-[13px]">
            <dt className="text-slate-500">Number</dt><dd className="text-right font-medium text-slate-900">{q.number}</dd>
            <dt className="text-slate-500">Date</dt><dd className="text-right text-slate-900">{dateText(q.created_at)}</dd>
            {q.valid_until && <><dt className="text-slate-500">Valid until</dt><dd className={`text-right ${expired ? 'text-red-700' : 'text-slate-900'}`}>{dateText(q.valid_until)}</dd></>}
          </dl>
        </header>

        <div className="p-6 sm:p-8">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="text-left text-[12px] uppercase tracking-wider text-slate-400">
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 font-medium text-right hidden sm:table-cell">Qty</th>
                <th className="pb-2 font-medium text-right hidden sm:table-cell">Rate</th>
                <th className="pb-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-y border-slate-100">
              {q.items.map((it, i) => (
                <tr key={i} className="align-top">
                  <td className="py-3 pr-4 text-slate-800">
                    {it.description}
                    <span className="sm:hidden block text-[12px] text-slate-500">{it.qty} × {money(it.rate, q.currency)}</span>
                  </td>
                  <td className="py-3 text-right tabular-nums text-slate-600 hidden sm:table-cell">{it.qty}</td>
                  <td className="py-3 text-right tabular-nums text-slate-600 hidden sm:table-cell">{money(it.rate, q.currency)}</td>
                  <td className="py-3 text-right tabular-nums font-medium text-slate-900">{money(quoteTotals([it]).subtotal, q.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="ml-auto mt-4 w-full max-w-xs space-y-1.5 text-[14px] tabular-nums">
            <div className="flex justify-between text-slate-600"><dt>Subtotal</dt><dd>{money(t.subtotal, q.currency)}</dd></div>
            {t.discount > 0 && <div className="flex justify-between text-slate-600"><dt>Discount</dt><dd>− {money(t.discount, q.currency)}</dd></div>}
            {q.tax_percent > 0 && <div className="flex justify-between text-slate-600"><dt>GST {q.tax_percent}%</dt><dd>{money(t.tax, q.currency)}</dd></div>}
            <div className="flex justify-between border-t border-slate-200 pt-2 text-[17px] font-semibold text-slate-900"><dt>Total</dt><dd>{money(t.total, q.currency)}</dd></div>
          </dl>

          {(q.notes || q.terms) && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 text-[13px] leading-6">
              {q.notes && <section><h2 className="text-[12px] font-semibold uppercase tracking-wider text-slate-400">Notes</h2><p className="mt-1 whitespace-pre-line text-slate-700">{q.notes}</p></section>}
              {q.terms && <section><h2 className="text-[12px] font-semibold uppercase tracking-wider text-slate-400">Terms</h2><p className="mt-1 whitespace-pre-line text-slate-700">{q.terms}</p></section>}
            </div>
          )}
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:px-8">
          {open && !mode && (
            <>
              <button type="button" onClick={() => setMode('accept')} className="btn-primary inline-flex items-center gap-1.5 h-10 rounded-lg px-4 text-sm font-semibold"><CheckCircle2 size={16} /> Accept quotation</button>
              <button type="button" onClick={() => setMode('decline')} className="inline-flex items-center h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:border-slate-300">Decline</button>
            </>
          )}
          <button type="button" onClick={pdf} className="ml-auto inline-flex items-center gap-1.5 h-10 rounded-lg px-3 text-sm font-medium text-slate-600 hover:text-slate-900"><Download size={15} /> Download PDF</button>
        </footer>

        {mode && (
          <form onSubmit={submit} className="relative border-t border-slate-200 p-6 sm:p-8 space-y-4">
            <input {...trapProps} value={trap} onChange={e => setTrap(e.target.value)} />
            {mode === 'accept' ? (
              <>
                <h2 className="text-[16px] font-semibold text-slate-900">Accept {q.number}</h2>
                <label className="block">
                  <span className="text-[13px] font-medium text-slate-700">Your full name</span>
                  <input required autoFocus value={name} onChange={e => setName(e.target.value)} maxLength={120} autoComplete="name"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" />
                </label>
                <label className="flex items-start gap-2 text-[13px] text-slate-700">
                  <input type="checkbox" required checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-orange-600" />
                  I accept this quotation for {money(t.total, q.currency)}{q.terms ? ' and its terms' : ''}.
                </label>
                <label className="block">
                  <span className="text-[13px] font-medium text-slate-700">Anything we should know? <span className="font-normal text-slate-400">(optional)</span></span>
                  <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} maxLength={2000}
                    className="mt-1 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" />
                </label>
              </>
            ) : (
              <>
                <h2 className="text-[16px] font-semibold text-slate-900">Decline {q.number}</h2>
                <label className="block">
                  <span className="text-[13px] font-medium text-slate-700">Could you tell us why? <span className="font-normal text-slate-400">(optional, it helps us improve)</span></span>
                  <textarea autoFocus value={note} onChange={e => setNote(e.target.value)} rows={3} maxLength={2000}
                    className="mt-1 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" />
                </label>
              </>
            )}
            {error && <p role="alert" className="text-[13px] text-red-700">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={busy || (mode === 'accept' && (!name.trim() || !agree))}
                className={`inline-flex items-center h-10 rounded-lg px-4 text-sm font-semibold disabled:opacity-50 ${mode === 'accept' ? 'btn-primary' : 'border border-slate-300 bg-white text-slate-800 hover:border-slate-400'}`}>
                {busy ? 'Sending…' : mode === 'accept' ? 'Confirm and accept' : 'Decline quotation'}
              </button>
              <button type="button" onClick={() => { setMode(null); setError('') }} className="inline-flex items-center h-10 rounded-lg px-3 text-sm font-medium text-slate-500 hover:text-slate-900">Cancel</button>
            </div>
          </form>
        )}
      </article>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-[13px] text-slate-500">
        <Mail size={14} /> Questions? <a href="mailto:connect@vikku.in" className="font-medium text-slate-700 hover:text-orange-700">connect@vikku.in</a> · +91 93939 79892
      </p>
    </Shell>
  )
}

function Shell({ children }) {
  return (
    <div className="adm min-h-screen">
      <header className="h-16 flex items-center gap-2 border-b border-slate-200 bg-white px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2 rounded-md"><img src="/logo-sm.png" alt="" width="28" height="28" className="h-7 w-7" /><span className="text-[15px] font-semibold text-slate-900">Vikku</span></a>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">{children}</main>
    </div>
  )
}

const BANNER = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  slate: 'border-slate-200 bg-white text-slate-800',
}
function Banner({ tone, icon: Icon, title, children }) {
  return (
    <div role="status" className={`mb-5 flex gap-3 rounded-xl border px-5 py-4 ${BANNER[tone]}`}>
      <Icon size={20} className="flex-none mt-0.5" />
      <div><p className="font-semibold">{title}</p><p className="mt-0.5 text-[14px] opacity-90">{children}</p></div>
    </div>
  )
}
