import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, Circle, Clock, Flag, ThumbsUp, ThumbsDown, MessageSquare, Send, Loader2, Lock, Paperclip, Download, File, FileImage, FileText } from 'lucide-react'
import { getProjectByToken, getTasks, getMilestones, updateMilestone, getClientComments, createClientComment, verifySharePin, approveTaskAsClient } from '../../lib/pmService'
import { notifyClientComment, notifyClientApproval, notifyMilestoneApproval, insertPmNotification } from '../../lib/notificationService'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

function ClientFileIcon({ mime }) {
  if (mime?.startsWith('image/')) return <FileImage size={13} className="text-blue-400 flex-shrink-0" />
  if (mime?.includes('pdf') || mime?.includes('word') || mime?.includes('text/')) return <FileText size={13} className="text-orange-400 flex-shrink-0" />
  return <File size={13} className="text-white/40 flex-shrink-0" />
}

function ClientFiles({ shareToken, projectId }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    if (!projectId || !shareToken) { setLoading(false); return }
    // Use the public pmService path — RLS won't allow this for unauthenticated users,
    // so we only show the list via a count; actual download goes through the edge function.
    // We fetch using the service-role edge function.
    const load = async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/get-client-file?share_token=${shareToken}&list=1`)
        if (res.ok) {
          const data = await res.json()
          setFiles(data.files || [])
        }
      } catch { /* silent */ }
      setLoading(false)
    }
    load()
  }, [shareToken, projectId])

  const handleDownload = async (fileId, fileName) => {
    setDownloading(fileId)
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/get-client-file?share_token=${shareToken}&file_id=${fileId}`)
      if (res.ok) {
        const { url } = await res.json()
        if (url) window.open(url, '_blank')
      }
    } catch { /* silent */ }
    setDownloading(null)
  }

  if (loading || files.length === 0) return null

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Paperclip size={14} className="text-white/30" />
        <h2 className="text-xs font-semibold text-white/80">Shared Files</h2>
        <span className="text-[10px] text-white/30">({files.length})</span>
      </div>
      <div className="space-y-2">
        {files.map((f) => (
          <div key={f.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 group">
            <ClientFileIcon mime={f.mime_type} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/70 truncate">{f.file_name}</p>
              {f.file_size > 0 && (
                <p className="text-[10px] text-white/30">
                  {f.file_size >= 1024 * 1024
                    ? `${(f.file_size / 1024 / 1024).toFixed(1)} MB`
                    : `${Math.round(f.file_size / 1024)} KB`}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDownload(f.id, f.file_name)}
              disabled={downloading === f.id}
              className="text-white/30 hover:text-white transition-colors flex-shrink-0"
            >
              {downloading === f.id
                ? <Loader2 size={13} className="animate-spin" />
                : <Download size={13} />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'In Review',
  done: 'Done',
}

const STATUS_COLORS = {
  todo: 'text-white/40',
  in_progress: 'text-blue-400',
  review: 'text-yellow-400',
  done: 'text-green-400',
}

function MilestoneApproval({ milestones, onUpdate, token, ownerUserId }) {
  const [approving, setApproving] = useState({})
  const [notes, setNotes] = useState({})
  const [showNote, setShowNote] = useState({})

  const handleApprove = async (m, status) => {
    setApproving((prev) => ({ ...prev, [m.id]: true }))
    const updated = await updateMilestone(m.id, {
      approval_status: status,
      client_note: notes[m.id] || null,
    })
    onUpdate(updated)
    setApproving((prev) => ({ ...prev, [m.id]: false }))
    setShowNote((prev) => ({ ...prev, [m.id]: false }))
    if (token) notifyMilestoneApproval({ shareToken: token, milestoneTitle: m.title, status, note: notes[m.id] })
    if (ownerUserId) insertPmNotification({
      userId: ownerUserId,
      type: status === 'approved' ? 'client_approved' : 'client_rejected',
      message: status === 'approved'
        ? `Client approved milestone "${m.title}"`
        : `Client requested revision on "${m.title}"`,
      subText: notes[m.id] || undefined,
      entityId: m.id,
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Flag size={14} className="text-white/60" />
        <h2 className="text-xs font-semibold text-white/80">Milestones</h2>
      </div>
      <div className="space-y-3">
        {milestones.map((m) => {
          const isPast = !m.completed && new Date(m.due_date) < new Date()
          const approval = m.approval_status
          return (
            <div key={m.id} className="glass rounded-xl px-4 py-3 space-y-2">
              <div className="flex items-center gap-3">
                {m.completed
                  ? <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                  : <Circle size={16} className={`flex-shrink-0 ${isPast ? 'text-red-400/60' : 'text-white/30'}`} />
                }
                <p className={`text-sm flex-1 ${m.completed ? 'line-through text-white/30' : 'text-white'}`}>{m.title}</p>
                <p className={`text-xs flex-shrink-0 ${isPast && !m.completed ? 'text-red-400/60' : 'text-white/40'}`}>
                  {new Date(m.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              {/* Approval status */}
              {approval === 'approved' && (
                <div className="flex items-center gap-1.5 text-green-400 text-xs pl-7">
                  <ThumbsUp size={11} /> <span>Approved by client</span>
                  {m.client_note && <span className="text-white/30 ml-2">"{m.client_note}"</span>}
                </div>
              )}
              {approval === 'rejected' && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs pl-7">
                  <ThumbsDown size={11} /> <span>Needs revision</span>
                  {m.client_note && <span className="text-white/30 ml-2">"{m.client_note}"</span>}
                </div>
              )}
              {/* Approval actions for completed milestones pending approval */}
              {m.completed && (!approval || approval === 'pending') && (
                <div className="pl-7 space-y-2">
                  {showNote[m.id] && (
                    <input
                      value={notes[m.id] || ''}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [m.id]: e.target.value }))}
                      placeholder="Add a note (optional)..."
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(m, 'approved')}
                      disabled={approving[m.id]}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25 transition-colors disabled:opacity-40"
                    >
                      <ThumbsUp size={11} /> Approve
                    </button>
                    <button
                      onClick={() => handleApprove(m, 'rejected')}
                      disabled={approving[m.id]}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-colors disabled:opacity-40"
                    >
                      <ThumbsDown size={11} /> Request revision
                    </button>
                    <button
                      onClick={() => setShowNote((prev) => ({ ...prev, [m.id]: !prev[m.id] }))}
                      className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showNote[m.id] ? 'hide note' : '+ note'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ClientComments({ projectId, shareToken }) {
  const [comments, setComments] = useState([])
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [loadingComments, setLoadingComments] = useState(true)

  useEffect(() => {
    getClientComments(shareToken).then((data) => {
      setComments(data)
      setLoadingComments(false)
    })
  }, [shareToken])

  const handlePost = async () => {
    if (!name.trim() || !content.trim()) return
    setPosting(true)
    try {
      const comment = await createClientComment({
        project_id: projectId,
        share_token: shareToken,
        author_name: name.trim(),
        content: content.trim(),
      })
      setComments((prev) => [...prev, comment])
      setContent('')
      notifyClientComment({ shareToken, authorName: name.trim(), comment: content.trim() })
    } catch (err) {
      console.error('Failed to post comment:', err)
    } finally {
      setPosting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={14} className="text-white/60" />
        <h2 className="text-xs font-semibold text-white/80">Leave a comment</h2>
        {comments.length > 0 && <span className="text-[10px] text-white/30">({comments.length})</span>}
      </div>

      {/* Existing comments */}
      {!loadingComments && comments.length > 0 && (
        <div className="space-y-3 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="glass rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[9px] text-white/60 font-semibold flex-shrink-0">
                  {c.author_name?.[0]?.toUpperCase() || 'A'}
                </div>
                <span className="text-xs font-medium text-white/70">{c.author_name}</span>
                <span className="text-[10px] text-white/25 ml-auto">
                  {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed pl-7">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <div className="glass rounded-xl p-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost() }}
          placeholder="Write a comment..."
          rows={3}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors resize-none"
        />
        <button
          onClick={handlePost}
          disabled={posting || !name.trim() || !content.trim()}
          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {posting ? <Loader2 size={12} className="animate-spin" /> : <Send size={11} />}
          Post comment
        </button>
      </div>
    </div>
  )
}

function TaskApprovals({ tasks, token, ownerUserId }) {
  const [approvalMap, setApprovalMap] = useState(() =>
    Object.fromEntries(tasks.map((t) => [t.id, { status: t.client_approval_status || null, note: t.client_approval_note || null }]))
  )
  const [approving, setApproving] = useState({})
  const [notes, setNotes] = useState({})
  const [showNote, setShowNote] = useState({})
  const [errors, setErrors] = useState({})

  const handleApprove = async (task, status) => {
    setApproving((prev) => ({ ...prev, [task.id]: true }))
    setErrors((prev) => ({ ...prev, [task.id]: null }))
    try {
      await approveTaskAsClient(task.id, token, status, notes[task.id] || null)
      setApprovalMap((prev) => ({ ...prev, [task.id]: { status, note: notes[task.id] || null } }))
      setShowNote((prev) => ({ ...prev, [task.id]: false }))
      notifyClientApproval({ shareToken: token, taskTitle: task.title, status, note: notes[task.id] })
      if (ownerUserId) insertPmNotification({
        userId: ownerUserId,
        type: status === 'approved' ? 'client_approved' : 'client_rejected',
        message: status === 'approved'
          ? `Client approved "${task.title}"`
          : `Client requested revision on "${task.title}"`,
        subText: notes[task.id] || undefined,
        entityId: task.id,
      })
    } catch (err) {
      setErrors((prev) => ({ ...prev, [task.id]: err?.message || 'Failed' }))
    }
    setApproving((prev) => ({ ...prev, [task.id]: false }))
  }

  const pending = tasks.filter((t) => {
    const s = approvalMap[t.id]?.status
    return !s || s === 'pending'
  })

  if (!tasks.length) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <ThumbsUp size={14} className="text-white/60" />
        <h2 className="text-xs font-semibold text-white/80">Task Approvals</h2>
        {pending.length > 0 && <span className="text-[10px] text-white/30">({pending.length} pending)</span>}
      </div>
      <div className="space-y-2">
        {tasks.map((task) => {
          const approval = approvalMap[task.id]?.status
          const note = approvalMap[task.id]?.note
          return (
            <div key={task.id} className="glass rounded-xl px-4 py-3 space-y-2">
              <p className="text-sm text-white">{task.title}</p>
              {approval === 'approved' && (
                <div className="flex items-center gap-1.5 text-green-400 text-xs">
                  <ThumbsUp size={11} /> <span>Approved</span>
                  {note && <span className="text-white/30 ml-2">"{note}"</span>}
                </div>
              )}
              {approval === 'needs_revision' && (
                <div className="flex items-center gap-1.5 text-orange-400 text-xs">
                  <ThumbsDown size={11} /> <span>Needs revision</span>
                  {note && <span className="text-white/30 ml-2">"{note}"</span>}
                </div>
              )}
              {(!approval || approval === 'pending') && (
                <div className="space-y-2">
                  {showNote[task.id] && (
                    <input
                      value={notes[task.id] || ''}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [task.id]: e.target.value }))}
                      placeholder="Add a note (optional)..."
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
                    />
                  )}
                  {errors[task.id] && <p className="text-[10px] text-red-400">{errors[task.id]}</p>}
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleApprove(task, 'approved')} disabled={approving[task.id]}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25 transition-colors disabled:opacity-40">
                      <ThumbsUp size={11} /> Approve
                    </button>
                    <button onClick={() => handleApprove(task, 'needs_revision')} disabled={approving[task.id]}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/25 transition-colors disabled:opacity-40">
                      <ThumbsDown size={11} /> Request revision
                    </button>
                    <button onClick={() => setShowNote((prev) => ({ ...prev, [task.id]: !prev[task.id] }))}
                      className="text-[10px] text-white/30 hover:text-white/60 transition-colors">
                      {showNote[task.id] ? 'hide note' : '+ note'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ClientView() {
  const { token } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinVerified, setPinVerified] = useState(false)
  const [pinError, setPinError] = useState('')
  const [pinChecking, setPinChecking] = useState(false)

  async function loadProjectData(projectId) {
    const [t, m] = await Promise.all([getTasks(projectId), getMilestones(projectId)])
    setTasks(t)
    setMilestones(m.sort((a, b) => new Date(a.due_date) - new Date(b.due_date)))
  }

  useEffect(() => {
    async function load() {
      const p = await getProjectByToken(token)
      if (!p) { setNotFound(true); setLoading(false); return }
      setProject(p)
      // Don't fetch project contents until the PIN is verified - otherwise the
      // data would be readable before the gate (PIN would be cosmetic).
      if (!p.has_share_pin) {
        await loadProjectData(p.id)
      }
      setLoading(false)
    }
    load()
  }, [token])

  const handleVerifyPin = async () => {
    if (!pinInput.trim()) return
    setPinChecking(true)
    setPinError('')
    try {
      const ok = await verifySharePin(token, pinInput.trim())
      if (ok) {
        await loadProjectData(project.id)
        setPinVerified(true)
      } else {
        setPinError('Incorrect PIN. Please try again.')
      }
    } catch {
      setPinError('Something went wrong. Please try again.')
    }
    setPinChecking(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl mb-2">Project not found</h1>
          <p className="text-white/50 text-sm">This share link may have expired or is invalid.</p>
        </div>
      </div>
    )
  }

  if (project?.has_share_pin && !pinVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-white/60" />
          </div>
          <h1 className="font-display font-bold text-white text-lg mb-1">PIN required</h1>
          <p className="text-xs text-white/40 mb-6">This project is protected. Enter the PIN to view it.</p>
          <input
            type="text"
            inputMode="numeric"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleVerifyPin() }}
            placeholder="Enter PIN"
            maxLength={8}
            autoFocus
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-center text-lg font-mono text-white tracking-widest placeholder-white/20 outline-none focus:border-white/20 transition-colors mb-3"
          />
          {pinError && <p className="text-xs text-red-400 mb-3">{pinError}</p>}
          <button
            onClick={handleVerifyPin}
            disabled={pinChecking || !pinInput.trim()}
            className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {pinChecking ? <Loader2 size={14} className="animate-spin" /> : 'Unlock'}
          </button>
        </div>
      </div>
    )
  }

  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const nextMilestone = milestones.find((m) => !m.completed)

  const lastUpdated = (() => {
    const dates = tasks.map((t) => t.updated_at || t.created_at).filter(Boolean)
    if (!dates.length) return null
    const latest = new Date(Math.max(...dates.map((d) => new Date(d).getTime())))
    const diff = Date.now() - latest.getTime()
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}h ago`
    return latest.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  })()

  const accentColor = project.client_brand_color || project.color || '#ffffff'

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Accent bar */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${accentColor}60, ${accentColor}15)` }} />

      {/* Header */}
      <div className="border-b border-white/[0.05] px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {project.client_brand_logo ? (
              <img
                src={project.client_brand_logo}
                alt={project.client_brand_name || 'Brand logo'}
                className="w-8 h-8 rounded-xl object-contain flex-shrink-0 bg-white/5"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${accentColor}20` }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-display font-semibold text-white text-sm sm:text-base truncate">{project.name}</h1>
              {project.client_name && (
                <p className="text-xs text-white/40 mt-0.5 truncate">For {project.client_name}</p>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] text-white/50 font-medium capitalize px-2 py-0.5 rounded-full border border-white/10 inline-block">{project.status || 'active'}</div>
            {lastUpdated && (
              <p className="text-[10px] text-white/25 mt-1">Updated {lastUpdated}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Progress', value: `${progress}%`, sub: `${doneTasks} of ${totalTasks} tasks done` },
            { label: 'In Progress', value: inProgress, sub: 'tasks active' },
            { label: 'Next Due', value: nextMilestone?.due_date ? new Date(nextMilestone.due_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-', sub: nextMilestone?.title || 'All milestones done' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 sm:p-5 text-center">
              <p className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-[10px] text-white/40 leading-tight">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-white">Project Progress</p>
            <p className="text-sm font-bold text-white">{progress}%</p>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: accentColor }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(STATUS_LABELS).map(([status, label]) => {
              const count = tasks.filter((t) => t.status === status).length
              return (
                <div key={status} className="text-center">
                  <p className={`text-sm font-bold ${STATUS_COLORS[status]}`}>{count}</p>
                  <p className="text-[10px] text-white/30">{label}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tasks by status */}
        {[...new Set(tasks.map((t) => t.status).filter(Boolean))].map((status) => {
          const filtered = tasks.filter((t) => t.status === status)
          if (filtered.length === 0) return null
          const label = STATUS_LABELS[status] || status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          const color = STATUS_COLORS[status] || 'text-white/60'
          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                {status === 'done'
                  ? <CheckCircle2 size={14} className="text-green-400" />
                  : status === 'in_progress'
                    ? <Clock size={14} className="text-blue-400" />
                    : <Circle size={14} className="text-white/40" />
                }
                <h2 className={`text-xs font-semibold ${color}`}>{label}</h2>
                <span className="text-[10px] text-white/30">({filtered.length})</span>
              </div>
              <div className="space-y-2">
                {filtered.map((task) => (
                  <div key={task.id} className="glass rounded-xl px-4 py-3">
                    <p className={`text-sm ${status === 'done' ? 'line-through text-white/40' : 'text-white'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-white/40 mt-1">{task.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Milestones */}
        {milestones.length > 0 && (
          <MilestoneApproval milestones={milestones} token={token} ownerUserId={project?.user_id} onUpdate={(updated) =>
            setMilestones((prev) => prev.map((m) => m.id === updated.id ? updated : m))
          } />
        )}

        {/* Task approvals */}
        {tasks.length > 0 && <TaskApprovals tasks={tasks} token={token} ownerUserId={project?.user_id} />}

        {/* Shared files */}
        <ClientFiles shareToken={token} projectId={project.id} />

        {/* Client comments */}
        <ClientComments projectId={project.id} shareToken={token} />

        {/* Footer */}
        <div className="flex flex-col items-center gap-2 pt-6 border-t border-white/[0.05]">
          {(project.client_brand_logo || project.client_brand_name) ? (
            <div className="flex items-center gap-2">
              {project.client_brand_logo && (
                <img src={project.client_brand_logo} alt={project.client_brand_name || 'logo'} className="h-5 object-contain" />
              )}
              {project.client_brand_name && (
                <span className="text-xs text-white/40 font-medium">{project.client_brand_name}</span>
              )}
            </div>
          ) : (
            <p className="text-xs text-white/20">Powered by <a href="https://vikku.in/pm" className="text-white/40 hover:text-white/60 transition-colors">Vikku PM</a></p>
          )}
        </div>
      </div>
    </div>
  )
}
