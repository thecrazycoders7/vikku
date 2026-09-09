import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { resetPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="glass rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={26} className="text-green-400" />
              </div>
              <h1 className="font-display font-extrabold text-2xl text-white mb-3">Check your inbox</h1>
              <p className="text-white/60 text-sm mb-2">We sent a password reset link to</p>
              <p className="text-white font-semibold text-sm mb-6">{email}</p>
              <p className="text-xs text-white/30 mb-6">The link expires in 1 hour. Check spam if you don't see it.</p>
              <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-display font-extrabold text-2xl text-white mb-2">Forgot password?</h1>
                <p className="text-white/60 text-sm">Enter your email and we'll send you a reset link.</p>
              </div>

              {error && (
                <div className="glass rounded-lg p-4 mb-6 flex items-start gap-3 border border-red-500/20">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs text-white/60 mb-2 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full glass rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="you@example.com"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
