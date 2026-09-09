import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Square, Loader2, Clock } from 'lucide-react'
import { startTimer, stopTimer, getRunningTimer } from '../../lib/pmService'
import { formatMinutes } from '../../lib/pmConstants'

function formatElapsed(ms) {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function TaskTimer({ task, projectId, user, isPro, onTimerStop, onShowUpgrade }) {
  const [runningLog, setRunningLog] = useState(null)   // the pm_time_logs row with is_running=true
  const [elapsed, setElapsed] = useState(0)             // ms since start
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const tickRef = useRef(null)

  const isRunning = !!runningLog

  // On mount: check if a timer is already running for this task
  useEffect(() => {
    if (!user || !task?.id || String(task.id).startsWith('temp-')) {
      setLoading(false)
      return
    }
    getRunningTimer(task.id, user.id).then((log) => {
      if (log) {
        setRunningLog(log)
        setElapsed(Date.now() - new Date(log.start_time).getTime())
      }
      setLoading(false)
    })
  }, [task?.id, user])

  // Tick every second when running
  useEffect(() => {
    if (isRunning) {
      tickRef.current = setInterval(() => {
        setElapsed(Date.now() - new Date(runningLog.start_time).getTime())
      }, 1000)
    } else {
      clearInterval(tickRef.current)
    }
    return () => clearInterval(tickRef.current)
  }, [isRunning, runningLog?.start_time])

  const handleStart = useCallback(async () => {
    if (!isPro) { onShowUpgrade?.(); return }
    if (!user || !task?.id || String(task.id).startsWith('temp-')) return
    setWorking(true)
    try {
      const log = await startTimer(task.id, projectId, user.id, user.email)
      setRunningLog(log)
      setElapsed(0)
    } catch (err) {
      console.error('startTimer:', err)
    } finally {
      setWorking(false)
    }
  }, [isPro, user, task?.id, projectId, onShowUpgrade])

  const handleStop = useCallback(async () => {
    if (!runningLog) return
    setWorking(true)
    try {
      const saved = await stopTimer(runningLog.id)
      setRunningLog(null)
      setElapsed(0)
      onTimerStop?.(saved)
    } catch (err) {
      console.error('stopTimer:', err)
    } finally {
      setWorking(false)
    }
  }, [runningLog, onTimerStop])

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-white/25">
        <Loader2 size={10} className="animate-spin" />
        <span>Checking timer…</span>
      </div>
    )
  }

  if (String(task?.id || '').startsWith('temp-')) return null

  return (
    <div className="flex items-center gap-2">
      {isRunning ? (
        <>
          <div className="flex items-center gap-1.5 text-sm font-mono font-semibold text-white tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
            {formatElapsed(elapsed)}
          </div>
          <button
            onClick={handleStop}
            disabled={working}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-all disabled:opacity-40"
          >
            {working ? <Loader2 size={10} className="animate-spin" /> : <Square size={10} fill="currentColor" />}
            Stop
          </button>
        </>
      ) : (
        <button
          onClick={handleStart}
          disabled={working}
          className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg bg-white/[0.06] text-white/60 border border-white/[0.08] hover:bg-white/10 hover:text-white transition-all disabled:opacity-40"
        >
          {working ? (
            <Loader2 size={10} className="animate-spin" />
          ) : (
            <Play size={10} fill="currentColor" />
          )}
          Start timer
          {!isPro && <span className="text-yellow-400/60 text-[9px]">Pro</span>}
        </button>
      )}
    </div>
  )
}
