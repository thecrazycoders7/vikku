import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import AppHeader from '../components/AppHeader'
import usePageMeta from '../hooks/usePageMeta'
import { useAuth } from '../contexts/AuthContext'
import { PREF_CATEGORIES, getEmailPrefs, saveEmailPrefs } from '../lib/emailPrefs'

function Toggle({ on, onClick }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-[var(--brand-primary)]' : 'bg-white/15'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  )
}

export default function NotificationPreferences() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [prefs, setPrefs] = useState(null)
  const [status, setStatus] = useState('idle') // idle | saving | saved | error

  usePageMeta({ title: 'Email Preferences - Vikku', description: 'Control which emails Vikku sends you.', url: 'https://vikku.in/dashboard/notifications' })

  useEffect(() => { if (!loading && !user) navigate('/login') }, [user, loading, navigate])
  useEffect(() => { if (user) getEmailPrefs(user.id).then(setPrefs) }, [user])

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }))

  const save = async () => {
    setStatus('saving')
    try { await saveEmailPrefs(user.id, prefs); setStatus('saved'); setTimeout(() => setStatus('idle'), 2500) }
    catch { setStatus('error') }
  }

  if (!user || !prefs) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center"><Loader2 className="animate-spin text-white/40" /></div>
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader breadcrumbs={[{ label: 'Email Preferences' }]} />
      <div className="max-w-2xl mx-auto px-6 py-12">
        <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8"><ArrowLeft size={15} /> Back to Dashboard</button>

        <h1 className="font-display font-extrabold text-3xl text-white mb-2">Email preferences</h1>
        <p className="text-white/50 text-sm mb-8">Choose what Vikku emails you about. Account and billing receipts are always sent.</p>

        <div className="glass rounded-2xl divide-y divide-white/[0.06]">
          {PREF_CATEGORIES.map((c) => (
            <div key={c.key} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium text-white">{c.label}</p>
                <p className="text-xs text-white/50 mt-0.5">{c.desc}</p>
              </div>
              <Toggle on={!!prefs[c.key]} onClick={() => toggle(c.key)} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-6">
          <button onClick={save} disabled={status === 'saving'} className="btn-primary px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 disabled:opacity-60">
            {status === 'saving' ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : 'Save preferences'}
          </button>
          {status === 'saved' && <span className="text-sm text-emerald-400 inline-flex items-center gap-1"><Check size={15} /> Saved</span>}
          {status === 'error' && <span className="text-sm text-red-400">Couldn’t save — try again</span>}
        </div>

        <p className="text-[11px] text-white/30 mt-6">To stop all marketing emails, turn off “Product &amp; tips”. You can also request full data deletion from the footer of any page.</p>
      </div>
    </div>
  )
}
