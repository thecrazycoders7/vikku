import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, X, Check, Loader2, RotateCcw, Send } from 'lucide-react'
import { planProject } from '../../lib/openaiService'
import { bulkCreateTasks, bulkCreateMilestones } from '../../lib/pmService'
import { useAuth } from '../../contexts/AuthContext'
import UpgradeModal from './UpgradeModal'
import useLockBodyScroll from '../../hooks/useLockBodyScroll'

export default function AIAssistant({ projectId, projectName, onDone, isPro, workflow }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  useLockBodyScroll(open)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  // history = [{role:'user'|'assistant', content: string | plan-object}]
  const [history, setHistory] = useState([])
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, open])

  const handleOpen = () => setOpen(true)

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg = { role: 'user', content: text }
    setHistory((h) => [...h, userMsg])
    setLoading(true)
    try {
      const contextSummary = history
        .filter((m) => m.role === 'user')
        .map((m) => (typeof m.content === 'string' ? m.content : '[AI plan result]'))
        .join(' | ')
      const prompt = contextSummary ? `${contextSummary} | ${text}` : `${projectName}: ${text}`
      const result = await planProject(prompt)
      setHistory((h) => [...h, { role: 'assistant', content: result }])
    } catch (err) {
      if (err.message === 'limit_reached' || err.message === 'pro_required') {
        setOpen(false)
        setShowUpgrade(true)
      } else {
        setHistory((h) => [...h, { role: 'assistant', content: { error: err.message } }])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddToProject = async (plan) => {
    setAdding(true)
    try {
      // Map every task into a valid stage of the active workflow. The AI/templates
      // emit generic statuses (e.g. 'todo') that may not exist in a custom workflow,
      // which would otherwise leave the tasks orphaned off the board.
      const stages = (workflow && workflow.length > 0) ? workflow : []
      const stageKeys = new Set(stages.map((s) => s.status_key))
      const firstKey = (stages.find((s) => !s.is_done) || stages[0])?.status_key
      const tasksWithProject = plan.tasks.map((t) => ({
        ...t,
        project_id: projectId,
        status: (firstKey && !stageKeys.has(t.status)) ? firstKey : t.status,
        created_by_email: user?.email || null,
      }))
      const milestonesWithProject = plan.milestones.map((m) => ({ ...m, project_id: projectId }))
      await Promise.all([bulkCreateTasks(tasksWithProject), bulkCreateMilestones(milestonesWithProject)])
      onDone()
      setOpen(false)
      setHistory([])
    } catch (err) {
      setHistory((h) => [...h, { role: 'assistant', content: { error: err.message } }])
    } finally {
      setAdding(false)
    }
  }

  const handleClose = () => { setOpen(false) }
  const handleClear = () => { setHistory([]); setInput('') }

  return (
    <>
      {showUpgrade && (
        <UpgradeModal
          reason="You've used all 6 free AI plans this month. Upgrade to Pro for unlimited AI project planning."
          onClose={() => setShowUpgrade(false)}
          onUpgraded={() => { setShowUpgrade(false); setOpen(true) }}
        />
      )}

      {!open && (
        <button
          onClick={handleOpen}
          className="flex items-center gap-1.5 sm:gap-2 text-xs bg-white/[0.06] hover:bg-white/10 text-white px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-xl transition-all border border-white/[0.08] hover:border-white/20"
        >
          {isPro ? <Sparkles size={14} className="text-yellow-400" /> : <Sparkles size={14} className="text-white/60" />}
          <span className="hidden sm:inline">Plan with AI</span>
          {!isPro && <span className="hidden sm:inline text-[10px] text-white/30 ml-0.5">Free</span>}
        </button>
      )}

      {open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl glass rounded-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-400" />
                <h3 className="font-display font-semibold text-white">AI Project Planner</h3>
              </div>
              <div className="flex items-center gap-3">
                {history.length > 0 && (
                  <button onClick={handleClear} className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/60 transition-colors">
                    <RotateCcw size={11} /> Clear
                  </button>
                )}
                <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              {history.length === 0 && (
                <p className="text-sm text-white/40 text-center py-8">
                  Describe what you're building and the AI will generate tasks + milestones.
                  <br />
                  <span className="text-[11px] text-white/25 mt-2 block">You can refine the plan with follow-up messages.</span>
                </p>
              )}

              {history.map((msg, i) => (
                <div key={i}>
                  {msg.role === 'user' && (
                    <div className="flex justify-end">
                      <div className="max-w-xs bg-white/10 rounded-2xl rounded-tr-sm px-4 py-2.5">
                        <p className="text-sm text-white">{msg.content}</p>
                      </div>
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.content?.error && (
                    <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-4 py-2.5">{msg.content.error}</p>
                  )}

                  {msg.role === 'assistant' && msg.content?.summary && (
                    <div className="bg-white/[0.03] rounded-2xl rounded-tl-sm p-4 space-y-4">
                      {/* Summary */}
                      <div>
                        <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">Summary</p>
                        <p className="text-sm text-white/80 leading-relaxed">{msg.content.summary}</p>
                      </div>

                      {/* Tasks */}
                      <div>
                        <p className="text-[10px] text-white/40 mb-2 uppercase tracking-wider">{msg.content.tasks.length} Tasks</p>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {msg.content.tasks.map((task, j) => (
                            <div key={j} className="flex items-start gap-3 bg-white/[0.03] rounded-xl px-3 py-2">
                              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                                task.priority === 'urgent' ? 'bg-red-400' :
                                task.priority === 'high' ? 'bg-orange-400' :
                                task.priority === 'medium' ? 'bg-yellow-400' : 'bg-white/30'
                              }`} />
                              <div>
                                <p className="text-xs font-medium text-white">{task.title}</p>
                                <p className="text-[10px] text-white/40 mt-0.5">{task.status} · {task.priority}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Milestones */}
                      <div>
                        <p className="text-[10px] text-white/40 mb-2 uppercase tracking-wider">{msg.content.milestones.length} Milestones</p>
                        <div className="space-y-1.5">
                          {msg.content.milestones.map((m, j) => (
                            <div key={j} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-3 py-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                              <p className="text-xs text-white flex-1">{m.title}</p>
                              <p className="text-[10px] text-white/40 flex-shrink-0">
                                {new Date(m.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToProject(msg.content)}
                        disabled={adding}
                        className="flex items-center gap-2 bg-white text-black font-semibold text-xs px-5 py-2 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40"
                      >
                        {adding ? <><Loader2 size={13} className="animate-spin" /> Adding...</> : <><Check size={13} /> Add to project</>}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-white/40">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Generating plan…</span>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 flex-shrink-0 border-t border-white/[0.06] pt-4">
              <div className="flex gap-2 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  rows={2}
                  maxLength={1000}
                  placeholder={history.length === 0
                    ? `e.g. "Build a 6-page website for a clothing brand. Launch in 6 weeks."`
                    : 'Refine the plan, add more detail, or ask for changes…'}
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="flex items-center justify-center w-10 h-10 bg-white rounded-xl hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={15} className="text-black" />
                </button>
              </div>
              <p className="text-[10px] text-white/20 mt-1.5 pl-1">Enter to send · Shift+Enter for new line</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
