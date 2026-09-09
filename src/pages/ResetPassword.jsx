import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  // Supabase fires PASSWORD_RECOVERY when the reset link is followed.
  // We gate the form on that event so the token is in the session.
  useEffect(() => {
    if (!supabase) { setReady(true); return }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // If user is already signed in via recovery link on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    const { error } = await updatePassword(password)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(() => navigate('/dashboard'), 2500)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8">
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={26} className="text-green-400" />
              </div>
              <h1 className="font-display font-extrabold text-2xl text-white mb-3">Password updated</h1>
              <p className="text-white/60 text-sm">Redirecting you to your dashboard...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-display font-extrabold text-2xl text-white mb-2">Set new password</h1>
                <p className="text-white/60 text-sm">Choose a strong password for your account.</p>
              </div>

              {error && (
                <div className="glass rounded-lg p-4 mb-6 flex items-start gap-3 border border-red-500/20">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {!ready && (
                <p className="text-sm text-white/40 mb-6">Verifying reset link...</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full glass rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="Min. 8 characters"
                      disabled={!ready}
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full glass rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="••••••••"
                      disabled={!ready}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !ready}
                  className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update password'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-xs text-white/40 hover:text-white transition-colors">Back to login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
