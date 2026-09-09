import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { User, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AppHeader from '../components/AppHeader'

export default function Account() {
  const { user, loading, displayName, updateProfile, updatePassword, signOut } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(displayName || '')
  const [nameMsg, setNameMsg] = useState('')
  const [nameSaving, setNameSaving] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />

  const saveName = async (e) => {
    e.preventDefault()
    setNameMsg('')
    setNameSaving(true)
    const { error } = await updateProfile({ name: name.trim() })
    setNameSaving(false)
    setNameMsg(error ? error.message : 'Name updated.')
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setPwMsg('')
    if (newPassword.length < 8) { setPwMsg('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { setPwMsg('Passwords do not match'); return }
    setPwSaving(true)
    const { error } = await updatePassword(newPassword)
    setPwSaving(false)
    if (error) {
      setPwMsg(error.message)
    } else {
      setPwMsg('Password updated.')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader breadcrumbs={[{ label: 'Account' }]} />

      <div className="max-w-xl mx-auto px-6 py-12 space-y-6">
        <h2 className="font-display font-extrabold text-2xl text-white">Account Settings</h2>

        {/* Profile */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-1 flex items-center gap-2"><User size={16} /> Profile</h3>
          <p className="text-xs text-white/40 mb-5">{user.email}</p>

          <form onSubmit={saveName} className="space-y-4">
            <div>
              <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="Your name"
              />
            </div>
            {nameMsg && (
              <p className={`text-xs flex items-center gap-1.5 ${nameMsg === 'Name updated.' ? 'text-green-400' : 'text-red-400'}`}>
                {nameMsg === 'Name updated.' ? <CheckCircle size={12} /> : <AlertCircle size={12} />} {nameMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={nameSaving}
              className="bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {nameSaving ? 'Saving...' : 'Save name'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-5 flex items-center gap-2"><Lock size={16} /> Change Password</h3>

          <form onSubmit={savePassword} className="space-y-4">
            <div>
              <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="••••••••"
              />
            </div>
            {pwMsg && (
              <p className={`text-xs flex items-center gap-1.5 ${pwMsg === 'Password updated.' ? 'text-green-400' : 'text-red-400'}`}>
                {pwMsg === 'Password updated.' ? <CheckCircle size={12} /> : <AlertCircle size={12} />} {pwMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={pwSaving}
              className="bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {pwSaving ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>

        {/* Sign out */}
        <div className="glass rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">Sign out</p>
            <p className="text-xs text-white/40">You can sign back in at any time.</p>
          </div>
          <button
            onClick={async () => { await signOut(); navigate('/') }}
            className="text-sm text-white/60 hover:text-white glass rounded-xl px-4 py-2 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
