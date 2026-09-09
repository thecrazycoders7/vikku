import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Mail, Lock, AlertCircle } from 'lucide-react'
import usePageMeta from '../hooks/usePageMeta'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 5 * 60 * 1000 // 5 minutes

function getLockoutState() {
  try {
    const raw = sessionStorage.getItem('login_lockout')
    if (!raw) return { attempts: 0, lockedUntil: 0 }
    return JSON.parse(raw)
  } catch { return { attempts: 0, lockedUntil: 0 } }
}

function saveLockoutState(state) {
  sessionStorage.setItem('login_lockout', JSON.stringify(state))
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lockoutSecsLeft, setLockoutSecsLeft] = useState(0)
  const { signIn, signInWithGoogle, user } = useAuth()
  const navigate = useNavigate()

  usePageMeta({
    title:       'Log In - Vikku',
    description: 'Log in to your Vikku account to access your dashboard, project management tools, and saved results.',
    url:         'https://vikku.in/login',
  })

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])
  const timerRef = useRef(null)

  useEffect(() => {
    const { lockedUntil } = getLockoutState()
    if (lockedUntil > Date.now()) startLockoutTimer(lockedUntil)
    return () => clearInterval(timerRef.current)
  }, [])

  function startLockoutTimer(lockedUntil) {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const secs = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (secs <= 0) {
        clearInterval(timerRef.current)
        setLockoutSecsLeft(0)
        saveLockoutState({ attempts: 0, lockedUntil: 0 })
      } else {
        setLockoutSecsLeft(secs)
      }
    }, 1000)
    setLockoutSecsLeft(Math.ceil((lockedUntil - Date.now()) / 1000))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const state = getLockoutState()
    if (state.lockedUntil > Date.now()) return

    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      const newAttempts = state.attempts + 1
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockedUntil = Date.now() + LOCKOUT_MS
        saveLockoutState({ attempts: newAttempts, lockedUntil })
        startLockoutTimer(lockedUntil)
        setError('')
      } else {
        saveLockoutState({ attempts: newAttempts, lockedUntil: 0 })
        setError(`${error.message} (${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? '' : 's'} left)`)
      }
      setLoading(false)
    } else {
      saveLockoutState({ attempts: 0, lockedUntil: 0 })
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="glass rounded-2xl p-8">
          <div className="mb-8">
            <h1 className="font-display font-extrabold text-2xl text-white mb-2">Welcome Back</h1>
            <p className="text-white/60 text-sm">Sign in to access AI tools and resources</p>
          </div>

          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-3 glass rounded-xl py-3 text-sm text-white/80 hover:text-white hover:bg-white/[0.07] transition-colors mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-xs text-white/30">or</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {lockoutSecsLeft > 0 && (
            <div className="glass rounded-lg p-4 mb-6 flex items-start gap-3 border border-red-500/20">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">
                Too many failed attempts. Try again in {Math.floor(lockoutSecsLeft / 60)}:{String(lockoutSecsLeft % 60).padStart(2, '0')}.
              </p>
            </div>
          )}

          {error && lockoutSecsLeft === 0 && (
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
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs text-white/60 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs text-white/40 hover:text-white transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || lockoutSecsLeft > 0}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : lockoutSecsLeft > 0 ? `Locked (${lockoutSecsLeft}s)` : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-white hover:text-white/80 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
