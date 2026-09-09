import { useEffect, useState } from 'react'
import { Users, Copy, Check, X, Link, Lock } from 'lucide-react'
import { getProjectMembers, removeProjectMember, getProjectMemberLimit } from '../../lib/pmService'

const FREE_LIMIT = 3
// The RPC encodes "unlimited" as int4 max since JSON has no Infinity
const normalizeLimit = (n) => (n >= 2147483647 ? Infinity : n)

const ROLE_STYLES = {
  admin:  'text-yellow-400/80',
  editor: 'text-blue-400/80',
  member: 'text-white/30',
  viewer: 'text-white/30',
}

export default function MembersPanel({ projectId, ownerUserId, currentUserId }) {
  const [members, setMembers] = useState([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [limit, setLimit] = useState(FREE_LIMIT)

  const isOwner = currentUserId === ownerUserId
  const joinUrl = `${window.location.origin}/pm/join/${projectId}`
  const total = members.length + 1 // +1 for owner
  const atLimit = total >= limit

  useEffect(() => {
    if (!projectId) return
    Promise.all([
      getProjectMembers(projectId),
      // SECURITY DEFINER RPC: members can't read the owner's subscription
      // directly (RLS limits user_subscriptions to your own row)
      getProjectMemberLimit(projectId),
    ])
      .then(([mems, lim]) => {
        setMembers(mems)
        setLimit(normalizeLimit(lim?.limit ?? FREE_LIMIT))
      })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [projectId])

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRemove = async (member) => {
    if (!window.confirm(`Remove ${member.email || 'this member'} from the project?`)) return
    try {
      await removeProjectMember(member.id)
      setMembers((prev) => prev.filter((m) => m.id !== member.id))
    } catch (err) {
      alert(err?.message || 'Failed to remove member')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-white/40 flex items-center gap-1.5">
          <Users size={11} />
          Team
        </p>
        <span className={`text-[10px] ${atLimit ? 'text-yellow-400/70' : 'text-white/20'}`}>
          {total}/{limit === Infinity ? '∞' : limit}
        </span>
      </div>

      {/* Owner */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/60 font-medium flex-shrink-0">
          O
        </div>
        <span className="text-xs text-white/60 truncate flex-1">{isOwner ? 'You (owner)' : 'Project owner'}</span>
        <span className="text-[9px] text-yellow-400/60">owner</span>
      </div>

      {/* Members */}
      {!loading && members.map((m) => (
        <div key={m.id} className="flex items-center gap-2 mb-1.5 group">
          <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] text-white/40 font-medium flex-shrink-0">
            {(m.email?.[0] || 'M').toUpperCase()}
          </div>
          <span className="text-xs text-white/50 truncate flex-1">
            {m.email || 'Member'}
            {m.user_id === currentUserId && <span className="text-white/30"> (you)</span>}
          </span>
          <span className={`text-[9px] ${ROLE_STYLES[m.role] || ROLE_STYLES.member}`}>{m.role || 'member'}</span>
          {isOwner && (
            <button
              onClick={() => handleRemove(m)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400"
            >
              <X size={11} />
            </button>
          )}
        </div>
      ))}

      {/* Limit warning */}
      {atLimit && limit !== Infinity && (
        <div className="flex items-center gap-1.5 mt-2 mb-1 text-[10px] text-yellow-400/60">
          <Lock size={9} />
          <span>Member limit reached - upgrade to add more</span>
        </div>
      )}

      {/* Viewer's own role + permissions */}
      {!isOwner && !loading && (() => {
        const me = members.find((m) => m.user_id === currentUserId)
        if (!me) return null
        const can = me.role === 'admin'
          ? 'You can manage tasks, milestones and delete tasks.'
          : 'You can create and edit tasks and milestones.'
        return (
          <p className="mt-2 text-[10px] text-white/25 leading-relaxed">
            Your role: <span className="text-white/50">{me.role || 'member'}</span>. {can} Only the owner can invite, share, or delete the project.
          </p>
        )
      })()}

      {/* Invite link */}
      {isOwner && !atLimit && (
        <button
          onClick={handleCopyLink}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 border border-white/[0.07] hover:border-white/20 rounded-lg py-2 transition-all"
        >
          {copied ? <><Check size={11} className="text-green-400" /> Copied!</> : <><Link size={11} /> Copy invite link</>}
        </button>
      )}
    </div>
  )
}
