import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Gift, Copy, Check, Users, Zap, Star, MessageCircle, Mail, ChevronRight, Clock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import AppHeader from '../../components/AppHeader'
import { supabase } from '../../lib/supabaseClient'

const REWARDS = [
  { count: 1, reward: '1 month Pro free', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  { count: 3, reward: '3 months Pro free', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  { count: 5, reward: '6 months Pro free', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
]

export default function ReferralPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [referralCount, setReferralCount] = useState(null)

  const refCode = user?.id?.slice(0, 8)
  const referralLink = `${window.location.origin}/signup?ref=${refCode}`

  useEffect(() => {
    if (!supabase || !refCode) return
    supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_code', refCode)
      .then(({ count }) => setReferralCount(count ?? 0))
  }, [refCode])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const waText = encodeURIComponent(`Hey! I use Vikku PM to manage my projects. Sign up free here: ${referralLink}`)
  const emailSubject = encodeURIComponent('Try Vikku PM - free project management tool')
  const emailBody = encodeURIComponent(`Hey,\n\nI've been using Vikku PM to manage my projects and it's been great. Thought you'd find it useful too.\n\nSign up free here: ${referralLink}\n\n- ${user?.email || 'A friend'}`)

  // Next reward milestone
  const nextReward = REWARDS.find(r => (referralCount ?? 0) < r.count) || REWARDS[REWARDS.length - 1]
  const prevCount = referralCount != null ? REWARDS.filter(r => r.count <= referralCount).length : 0
  const earnedRewards = REWARDS.filter(r => r.count <= (referralCount ?? 0))

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader breadcrumbs={[{ label: 'Projects', href: '/pm/dashboard' }, { label: 'Refer & Earn' }]} />

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-5">
            <Gift size={28} className="text-yellow-400" />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-white mb-3">Refer & Earn</h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
            Share Vikku PM with teammates and founders. When they upgrade, <span className="text-white font-medium">both of you get free Pro time</span>.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="glass-strong rounded-2xl p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users size={16} className="text-white/40" />
            </div>
            <p className="text-3xl font-bold text-white">
              {referralCount == null ? '0' : referralCount}
            </p>
            <p className="text-xs text-white/40 mt-1">Friends joined</p>
          </div>
          <div className="glass-strong rounded-2xl p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star size={16} className="text-white/40" />
            </div>
            <p className="text-3xl font-bold text-white">{earnedRewards.length}</p>
            <p className="text-xs text-white/40 mt-1">Rewards earned</p>
          </div>
        </div>

        {/* Reward progress */}
        <div className="glass rounded-2xl p-6 mb-6">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-4">Reward Milestones</p>
          <div className="space-y-3">
            {REWARDS.map((r) => {
              const achieved = (referralCount ?? 0) >= r.count
              return (
                <div key={r.count} className={`flex items-center gap-4 rounded-xl px-4 py-3 border ${achieved ? r.bg : 'bg-white/[0.02] border-white/[0.06]'}`}>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${achieved ? r.color : 'text-white/40'}`}>{r.reward}</p>
                    <p className="text-[10px] text-white/30">{r.count} referral{r.count > 1 ? 's' : ''} needed</p>
                  </div>
                  {achieved ? (
                    <span className="text-[10px] font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Earned</span>
                  ) : (
                    <span className="text-[10px] text-white/25">{r.count - (referralCount ?? 0)} to go</span>
                  )}
                </div>
              )
            })}
          </div>

          {referralCount != null && referralCount < nextReward.count && (
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] text-white/30">Progress to next reward</p>
                <p className="text-[10px] text-white/50">{referralCount}/{nextReward.count}</p>
              </div>
              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/40 transition-all"
                  style={{ width: `${Math.round((referralCount / nextReward.count) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Share link */}
        <div className="glass rounded-2xl p-6 mb-6">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Your referral link</p>
          <div className="flex gap-2 mb-4">
            <code className="flex-1 text-xs text-white/60 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 truncate select-all">
              {referralLink}
            </code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs bg-white text-black px-4 py-2 rounded-xl font-semibold hover:bg-white/90 transition-colors flex-shrink-0"
            >
              {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>

          <div className="flex gap-2">
            <a
              href={`https://wa.me/?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-xl bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25 transition-colors"
            >
              <MessageCircle size={13} /> Share on WhatsApp
            </a>
            <a
              href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
              className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-xl glass text-white/60 hover:text-white transition-colors"
            >
              <Mail size={13} /> Send via Email
            </a>
          </div>
        </div>

        {/* How it works */}
        <div className="glass rounded-2xl p-6 mb-8">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-4">How it works</p>
          <div className="space-y-4">
            {[
              { icon: <Copy size={14} />, title: 'Share your link', desc: 'Copy your unique link and share it with anyone who manages projects.' },
              { icon: <Users size={14} />, title: 'They sign up free', desc: 'Your friend creates an account. No credit card, no pressure.' },
              { icon: <Zap size={14} />, title: 'They upgrade → both win', desc: 'When they subscribe to Pro, you both get free months automatically.' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0 text-white/40 mt-0.5">
                  {step.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending reward note */}
        {referralCount != null && referralCount > 0 && earnedRewards.length > 0 && (
          <div className="glass rounded-xl px-4 py-3 mb-8 flex items-center gap-3 border border-yellow-400/15">
            <Clock size={14} className="text-yellow-400 flex-shrink-0" />
            <p className="text-xs text-white/60">
              Rewards are applied manually. Our team will add free months to your account within 24 hours of a referral upgrading.
            </p>
          </div>
        )}

        <button
          onClick={() => navigate('/pm/dashboard')}
          className="flex items-center gap-2 text-sm text-white/30 hover:text-white transition-colors mx-auto"
        >
          Back to projects
        </button>
      </div>
    </div>
  )
}
