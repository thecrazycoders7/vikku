import { useEffect, useState } from 'react'
import { X, Users, Copy, Check, Link, Lock, Loader2 } from 'lucide-react'
import { getProjectMembers, getProjectMemberLimit } from '../../lib/pmService'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'

const FREE_LIMIT = 3
// The RPC encodes "unlimited" as int4 max since JSON has no Infinity
const normalizeLimit = (n) => (n >= 2147483647 ? Infinity : n)

export default function InviteMemberModal({ projectId, projectName, onClose }) {
  useLockBodyScroll()
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [memberCount, setMemberCount] = useState(0)
  const [limit, setLimit] = useState(FREE_LIMIT)

  const joinUrl = `${window.location.origin}/pm/join/${projectId}`
  const total = memberCount + 1 // +1 for owner
  const remaining = limit === Infinity ? Infinity : limit - total
  const atLimit = remaining <= 0

  useEffect(() => {
    Promise.all([
      getProjectMembers(projectId),
      // SECURITY DEFINER RPC works for any viewer, not just the owner
      getProjectMemberLimit(projectId),
    ])
      .then(([mems, lim]) => {
        setMemberCount(mems.length)
        setLimit(normalizeLimit(lim?.limit ?? FREE_LIMIT))
      })
      .finally(() => setLoading(false))
  }, [projectId])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Invite to {projectName || 'Project'}</h2>
              <p className="text-xs text-white/40">
                {loading ? 'Loading…' : limit === Infinity ? `${total} members` : `${total} / ${limit} members used`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-white/30" size={20} />
          </div>
        ) : atLimit ? (
          <div className="space-y-4">
            <div className="bg-yellow-400/5 border border-yellow-400/10 rounded-xl p-4 flex items-start gap-3">
              <Lock size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white mb-1">Member limit reached</p>
                <p className="text-xs text-white/50">
                  Your project is at the {limit}-member limit for the {limit === 3 ? 'Free' : 'Pro'} plan.
                  Upgrade to {limit === 3 ? 'Pro (10 members)' : 'Team (unlimited)'} to invite more people.
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-full text-sm text-white/40 hover:text-white transition-colors py-2">
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
              <p className="text-[11px] text-white/40 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Link size={10} /> Invite link</span>
                {limit !== Infinity && (
                  <span className="text-white/30">{remaining} slot{remaining !== 1 ? 's' : ''} remaining</span>
                )}
              </p>
              <p className="text-xs text-white/70 font-mono break-all leading-relaxed">{joinUrl}</p>
            </div>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold text-sm px-4 py-3 rounded-xl hover:bg-white/90 transition-colors"
            >
              {copied ? (
                <><Check className="w-4 h-4 text-green-600" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copy invite link</>
              )}
            </button>

            <p className="text-[11px] text-white/30 text-center">
              Teammates must be logged in to join. Each person visits the link once to get access.
            </p>

            <button onClick={onClose} className="w-full text-sm text-white/40 hover:text-white transition-colors py-1">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
