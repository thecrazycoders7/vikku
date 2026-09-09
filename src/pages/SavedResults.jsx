import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, FileText, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getMyToolResults, TOOL_LABELS } from '../lib/toolResultsService'

const TOOL_COLORS = {
  cost_estimator:      'text-green-400 bg-green-500/10',
  roi_calculator:      'text-violet-400 bg-violet-500/10',
  timeline_calculator: 'text-blue-400 bg-blue-500/10',
  tech_recommender:    'text-cyan-400 bg-cyan-500/10',
}

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SavedResults() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [rows, setRows] = useState(null)

  useEffect(() => {
    if (!loading && !user) { navigate('/login'); return }
    if (user) getMyToolResults(user.id).then(setRows)
  }, [user, loading, navigate])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} /> Dashboard
          </button>
          <h1 className="font-display font-bold text-lg">My Saved Results</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {rows === null ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="animate-spin text-white/40" /></div>
        ) : rows.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <FileText size={28} className="text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-sm mb-6">You haven't generated any tool results yet.</p>
            <button onClick={() => navigate('/dashboard')} className="bg-white text-black font-semibold px-6 py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm">
              Try the free tools
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/r/${r.share_id}`)}
                className="w-full glass rounded-xl p-4 flex items-center gap-4 text-left hover:border-white/20 transition-colors"
              >
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg flex-shrink-0 ${TOOL_COLORS[r.tool] || 'text-white/60 bg-white/10'}`}>
                  {TOOL_LABELS[r.tool] || r.tool}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-white truncate">{r.title || 'Result'}</span>
                  <span className="block text-[11px] text-white/40">{timeAgo(r.created_at)}</span>
                </span>
                <ArrowUpRight size={16} className="text-white/30 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
