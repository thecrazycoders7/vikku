import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { trapProps } from '../lib/signup'
import useLockBodyScroll from '../hooks/useLockBodyScroll'

// Live demo links are never shown on the site. Visitors ask for one here; api/contact.js saves the
// request as a CRM lead (with the link to send) and emails connect@vikku.in.
const FORMS = {
  school: {
    product: 'School management system',
    org: 'School name',
    roles: ['Principal', 'Owner or trustee', 'Administrator', 'Teacher', 'Office or IT staff', 'Other'],
    size: 'Number of students',
    sizes: ['Under 300', '300 to 1,000', '1,000 to 3,000', 'Over 3,000'],
  },
  restaurant: {
    product: 'Restaurant management system',
    org: 'Restaurant name',
    roles: ['Owner', 'Manager', 'Chef', 'Other'],
    size: 'Number of outlets',
    sizes: ['1', '2 to 5', '6 to 20', 'Over 20'],
  },
}

const EMPTY = { name: '', role: '', email: '', phone: '', org: '', city: '', size: '', message: '' }

export default function DemoRequest({ product, label = 'Request a live demo', className = 'btn btn-ghost' }) {
  const f = FORMS[product]
  const [open, setOpen] = useState(false)
  const [v, setV] = useState(EMPTY)
  const [trap, setTrap] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [error, setError] = useState('')
  const startedAt = useRef(0)
  const first = useRef(null)
  const opener = useRef(null)

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    startedAt.current = Date.now()
    first.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const close = () => { setOpen(false); opener.current?.focus() }
  const show = () => {
    if (status === 'done') { setV(EMPTY); setStatus('idle') } // a fresh form for a second request
    setOpen(true)
  }
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setStatus('sending'); setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'demo', product, ...v, website: trap, elapsedMs: Date.now() - startedAt.current }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      setStatus('done')
    } catch (err) {
      setError(err.message); setStatus('error')
    }
  }

  const field = (k, labelText, props = {}) => (
    <label className="dr-field">
      <span>{labelText}</span>
      <input value={v[k]} onChange={set(k)} required maxLength={200} {...props} />
    </label>
  )
  const select = (k, labelText, options) => (
    <label className="dr-field">
      <span>{labelText}</span>
      <select value={v[k]} onChange={set(k)} required>
        <option value="" disabled>Choose one</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </label>
  )

  return (
    <>
      <button type="button" ref={opener} className={className} onClick={show}>{label}</button>
      {/* Portal to the page root: .svc-main is its own stacking context, below the sticky nav. */}
      {open && createPortal(
        <div className="dr-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
          <div className="dr-dialog" role="dialog" aria-modal="true" aria-labelledby="dr-title">
            <button type="button" className="dr-close" onClick={close} aria-label="Close"><X size={18} /></button>
            {status === 'done' ? (
              <div className="dr-done" role="status">
                <h2 id="dr-title">Request received</h2>
                <p>Thanks, {v.name.split(' ')[0]}. We'll check your details and send the demo link for the {f.product.toLowerCase()} to <strong>{v.email}</strong>.</p>
                <button type="button" className="btn btn-primary" onClick={close}>Close</button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h2 id="dr-title">Request a live demo</h2>
                <p className="dr-sub">Tell us a little about you and we'll send you a link to the {f.product.toLowerCase()} demo.</p>
                <input {...trapProps} value={trap} onChange={e => setTrap(e.target.value)} />
                <div className="dr-grid">
                  {field('name', 'Your name', { ref: first, autoComplete: 'name' })}
                  {select('role', 'Your role', f.roles)}
                  {field('email', 'Work email', { type: 'email', autoComplete: 'email', maxLength: 254 })}
                  {field('phone', 'Phone or WhatsApp', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', pattern: '[0-9+\\-\\(\\) ]{7,20}', title: 'A phone number, digits only' })}
                  {field('org', f.org, { autoComplete: 'organization' })}
                  {field('city', 'City', { autoComplete: 'address-level2' })}
                  {select('size', f.size, f.sizes)}
                </div>
                <label className="dr-field">
                  <span>Anything you'd like to see? <i>Optional</i></span>
                  <textarea value={v.message} onChange={set('message')} rows={3} maxLength={2000} />
                </label>
                {status === 'error' && <p className="dr-error" role="alert">{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Request the demo'}
                </button>
              </form>
            )}
          </div>
        </div>,
        opener.current?.closest('.v3d') || document.body,
      )}
    </>
  )
}
