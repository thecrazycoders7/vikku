import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search, AlertTriangle, CheckCircle, Users, Lock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getProject, getProjectMembers, joinProject, getProjectMemberLimit } from '../../lib/pmService'

export default function JoinProject() {
  const { projectId } = useParams()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading | joining | already | done | error | notfound | full
  const [project, setProject] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (loading) return
    if (!user) {
      // Redirect to signup, come back after auth
      navigate(`/signup?next=/pm/join/${projectId}`)
      return
    }
    join()
  }, [user, loading])

  async function join() {
    try {
      const p = await getProject(projectId)
      if (!p) { setStatus('notfound'); return }
      setProject(p)

      // Owner doesn't need to join their own project
      if (p.user_id === user.id) {
        navigate(`/pm/projects/${p.slug || p.id}`)
        return
      }

      // Check if already a member
      const members = await getProjectMembers(projectId)
      const alreadyMember = members.some((m) => m.user_id === user.id)
      if (alreadyMember) {
        setStatus('already')
        setTimeout(() => navigate(`/pm/projects/${p.slug || p.id}`), 1500)
        return
      }

      // Check member limit using SECURITY DEFINER RPC (bypasses RLS so joiner
      // can read the owner's plan without the cross-user read being blocked).
      const { limit } = await getProjectMemberLimit(projectId)
      // members.length = rows in pm_project_members (excludes owner), +1 accounts for owner
      if (limit !== Infinity && members.length + 1 >= limit) {
        setStatus('full')
        return
      }

      setStatus('joining')
      await joinProject(projectId, user.id, user.email)
      setStatus('done')
      setTimeout(() => navigate(`/pm/projects/${p.slug || p.id}`), 1500)
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong')
      setStatus('error')
    }
  }

  if (status === 'full') {
    return (
      <Screen>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-5">
            <Lock size={24} className="text-yellow-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Project is full</h2>
          <p className="text-sm text-white/40 mb-6">
            This project has reached its member limit. Ask the project owner to upgrade to Pro or Team for more members.
          </p>
          <button onClick={() => navigate('/pm/dashboard')} className="bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors">
            Go to Dashboard
          </button>
        </div>
      </Screen>
    )
  }

  if (status === 'notfound') {
    return (
      <Screen>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.06] flex items-center justify-center mx-auto mb-5">
            <Search size={24} className="text-white/40" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Project not found</h2>
          <p className="text-sm text-white/40 mb-6">This invite link may be invalid or the project was deleted.</p>
          <button onClick={() => navigate('/pm/dashboard')} className="bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors">
            Go to Dashboard
          </button>
        </div>
      </Screen>
    )
  }

  if (status === 'error') {
    return (
      <Screen>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Could not join</h2>
          <p className="text-sm text-white/40 mb-6">{errorMsg}</p>
          <button onClick={() => navigate('/pm/dashboard')} className="bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors">
            Go to Dashboard
          </button>
        </div>
      </Screen>
    )
  }

  if (status === 'already') {
    return (
      <Screen>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={24} className="text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">You're already a member</h2>
          <p className="text-sm text-white/40">Taking you to the project…</p>
        </div>
      </Screen>
    )
  }

  if (status === 'done') {
    return (
      <Screen>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.08] flex items-center justify-center mx-auto mb-5">
            <Users size={24} className="text-white/60" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">You joined {project?.name}!</h2>
          <p className="text-sm text-white/40">Taking you to the project…</p>
        </div>
      </Screen>
    )
  }

  return (
    <Screen>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-white/50">{status === 'joining' ? 'Joining project…' : 'Loading…'}</p>
      </div>
    </Screen>
  )
}

function Screen({ children }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-10 max-w-sm w-full">
        {children}
      </div>
    </div>
  )
}
