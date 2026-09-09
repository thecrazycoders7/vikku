import { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

const STAGES = [
  { key: 'backlog',   name: 'Backlog',      color: '#6b7280' },
  { key: 'progress',  name: 'In Progress',  color: '#8b5cf6' },
  { key: 'done',      name: 'Done',         color: '#22c55e' },
]

const TASKS = [
  { id: 'a', title: 'Landing page redesign', label: 'Design',  labelColor: '#8b5cf6', priority: '#ef4444', avatar: 'AJ' },
  { id: 'b', title: 'Fix mobile nav bug',    label: 'Bug',     labelColor: '#ef4444', priority: '#ef4444', avatar: 'RS' },
  { id: 'c', title: 'API integration',       label: 'Dev',     labelColor: '#3b82f6', priority: '#f97316', avatar: 'MK' },
  { id: 'd', title: 'Content review',        label: 'Review',  labelColor: '#eab308', priority: '#3b82f6', avatar: 'PD' },
  { id: 'e', title: 'Logo variations',       label: 'Design',  labelColor: '#8b5cf6', priority: '#f97316', avatar: 'AJ' },
]

// Initial column indices: 0 = Backlog, 1 = In Progress, 2 = Done
const INIT = { a: 0, b: 1, c: 2, d: 0, e: 2 }
// Which task to advance each tick
const SEQ = ['d', 'b', 'a', 'e', 'c']

export default function KanbanHero() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const c = {
    cardBg:     isLight ? 'rgba(15,23,42,0.03)'              : 'rgba(255,255,255,0.04)',
    cardBorder: isLight ? 'rgba(15,23,42,0.08)'              : 'rgba(255,255,255,0.08)',
    cardShadow: isLight ? '0 32px 80px rgba(15,23,42,0.12)'  : '0 32px 80px rgba(0,0,0,0.5)',
    barBg:      isLight ? 'rgba(15,23,42,0.035)'             : 'rgba(0,0,0,0.3)',
    barBorder:  isLight ? 'rgba(15,23,42,0.08)'              : 'rgba(255,255,255,0.06)',
    urlBg:      isLight ? 'rgba(15,23,42,0.035)'             : 'rgba(255,255,255,0.04)',
    urlBorder:  isLight ? 'rgba(15,23,42,0.08)'              : 'rgba(255,255,255,0.06)',
    colBg:      isLight ? 'rgba(15,23,42,0.02)'              : 'rgba(255,255,255,0.02)',
    taskBg:     isLight ? 'rgba(15,23,42,0.035)'             : 'rgba(255,255,255,0.05)',
    taskBorder: isLight ? 'rgba(15,23,42,0.08)'              : 'rgba(255,255,255,0.07)',
    dropBorder: isLight ? 'rgba(15,23,42,0.15)'              : 'rgba(255,255,255,0.07)',
    footBg:     isLight ? 'rgba(15,23,42,0.025)'             : 'rgba(0,0,0,0.2)',
    footBorder: isLight ? 'rgba(15,23,42,0.08)'              : 'rgba(255,255,255,0.05)',
    reflection: isLight ? 'rgba(15,23,42,0.04)'              : 'rgba(255,255,255,0.04)',
  }
  const [positions, setPositions] = useState(INIT)
  const [tick, setTick] = useState(0)
  const [fading, setFading] = useState(null)
  const [entering, setEntering] = useState(null)

  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => {
        const taskId = SEQ[t % SEQ.length]
        setFading(taskId)
        setTimeout(() => {
          setPositions(p => ({ ...p, [taskId]: (p[taskId] + 1) % 3 }))
          setFading(null)
          setEntering(taskId)
          setTimeout(() => setEntering(null), 350)
        }, 280)
        return t + 1
      })
    }, 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="w-full max-w-[440px] mx-auto select-none">
      {/* Browser chrome */}
      <div className="rounded-2xl overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}`, boxShadow: c.cardShadow }}>
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${c.barBorder}`, background: c.barBg }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 mx-3 rounded-md text-[10px] text-white/20 px-2 py-0.5 text-center" style={{ background: c.urlBg, border: `1px solid ${c.urlBorder}` }}>
            vikku.in · Project Board
          </div>
        </div>

        {/* Kanban board */}
        <div className="grid grid-cols-3 gap-2 p-3">
          {STAGES.map((stage, si) => {
            const allStageTasks = TASKS.filter(t => positions[t.id] === si)
            // Cap visible cards at 2 so a column never grows taller than the others
            // mid-animation - keeps the whole widget's height stable across frames.
            const stageTasks = allStageTasks.slice(0, 2)
            return (
              <div key={stage.key} className="flex flex-col gap-2 rounded-xl p-2 h-[230px]" style={{ background: c.colBg }}>
                {/* Column header */}
                <div className="flex items-center gap-1.5 mb-1 px-0.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                  <span className="text-[9px] font-semibold text-white/60 truncate">{stage.name}</span>
                  <span className="ml-auto text-[8px] text-white/25 bg-white/[0.05] rounded-full px-1.5 py-0.5 leading-none">{allStageTasks.length}</span>
                </div>
                <div className="h-px rounded-full mb-1" style={{ backgroundColor: `${stage.color}40` }} />

                {/* Task cards */}
                <div className="flex flex-col gap-1.5 flex-1">
                  {stageTasks.map(task => (
                    <div
                      key={task.id}
                      style={{
                        background: c.taskBg,
                        border: `1px solid ${c.taskBorder}`,
                        borderRadius: 8,
                        padding: '7px 8px',
                        opacity: fading === task.id ? 0 : entering === task.id ? 1 : 1,
                        transform: fading === task.id
                          ? 'translateY(-6px) scale(0.97)'
                          : entering === task.id
                          ? 'translateY(0) scale(1)'
                          : 'translateY(0) scale(1)',
                        transition: fading === task.id
                          ? 'opacity 0.28s ease, transform 0.28s ease'
                          : entering === task.id
                          ? 'opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s'
                          : 'none',
                      }}
                    >
                      {/* Label */}
                      <div
                        className="inline-block text-[7px] font-semibold rounded px-1 py-0.5 mb-1.5 leading-none"
                        style={{ background: `${task.labelColor}20`, color: task.labelColor }}
                      >
                        {task.label}
                      </div>
                      {/* Title */}
                      <p className="text-[9px] text-white/80 font-medium leading-tight mb-2">{task.title}</p>
                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.priority }} />
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-bold text-black"
                          style={{ background: task.labelColor }}
                        >
                          {task.avatar[0]}
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageTasks.length === 0 && (
                    <div className="flex-1 rounded-lg flex items-center justify-center min-h-[60px]" style={{ border: `1px dashed ${c.dropBorder}` }}>
                      <span className="text-[8px] text-white/15">Drop here</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center gap-3 px-4 py-2" style={{ borderTop: `1px solid ${c.footBorder}`, background: c.footBg }}>
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[9px] text-white/25">Live updates enabled</span>
          <span className="ml-auto text-[9px] text-white/20">{TASKS.length} tasks</span>
        </div>
      </div>

      {/* Reflection */}
      <div className="h-12 mt-0.5 rounded-b-2xl opacity-20 pointer-events-none" style={{
        background: `linear-gradient(to bottom, ${c.reflection}, transparent)`,
        transform: 'scaleY(-1)',
        maskImage: 'linear-gradient(to bottom, black, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
      }} />
    </div>
  )
}
