import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { getToolResultCount, TOOL_LABELS } from '../../lib/toolResultsService'

// Shows a live "N generated" trust line. Only renders once the real count is
// meaningful (>= MIN) so we never display a weak number.
const MIN = 25

export default function ToolSocialProof({ tool }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let alive = true
    getToolResultCount(tool).then((n) => { if (alive) setCount(n) })
    return () => { alive = false }
  }, [tool])

  if (count < MIN) return null

  const noun = (TOOL_LABELS[tool] || 'result').toLowerCase() + 's'
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="inline-flex items-center gap-2 text-xs text-white/50">
        <Sparkles size={12} className="text-violet-400" />
        <span><span className="text-white/80 font-semibold">{count.toLocaleString('en-IN')}+</span> {noun} generated with this tool</span>
      </div>
      <span className="text-[10px] text-white/25 border border-white/[0.06] rounded-full px-2 py-0.5">
        Based on real Indian agency projects
      </span>
    </div>
  )
}
