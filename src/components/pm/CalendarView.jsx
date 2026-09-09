import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

export default function CalendarView({ tasks, milestones }) {
  const today = new Date()
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selected, setSelected] = useState(null)

  const { year, month } = current

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Build lookup: dateStr -> { tasks, milestones }
  const dayMap = {}
  tasks.forEach((t) => {
    if (!t.due_date) return
    const d = t.due_date.slice(0, 10)
    if (!dayMap[d]) dayMap[d] = { tasks: [], milestones: [] }
    dayMap[d].tasks.push(t)
  })
  milestones.forEach((m) => {
    if (!m.due_date) return
    const d = m.due_date.slice(0, 10)
    if (!dayMap[d]) dayMap[d] = { tasks: [], milestones: [] }
    dayMap[d].milestones.push(m)
  })

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const prevMonth = () => setCurrent(({ year, month }) =>
    month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
  )
  const nextMonth = () => setCurrent(({ year, month }) =>
    month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
  )

  const cells = []
  // Leading blanks
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  // Trailing blanks to complete grid
  while (cells.length % 7 !== 0) cells.push(null)

  const getDateStr = (day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const selectedStr = selected ? getDateStr(selected) : null
  const selectedItems = selectedStr ? dayMap[selectedStr] : null

  return (
    <div className="glass rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-white/60" />
          <h3 className="font-display font-semibold text-sm text-white">
            {MONTHS[month]} {year}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setCurrent({ year: today.getFullYear(), month: today.getMonth() })}
            className="text-[10px] text-white/40 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-all"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] text-white/30 py-1 font-medium">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`blank-${idx}`} />
          const str = getDateStr(day)
          const items = dayMap[str]
          const taskCount = items?.tasks.length || 0
          const msCount = items?.milestones.length || 0
          const hasOverdue = items?.tasks.some(t => new Date(t.due_date) < today && t.status !== 'done')
            || items?.milestones.some(m => !m.completed && new Date(m.due_date) < today)
          const isSelected = selected === day

          return (
            <button
              key={day}
              onClick={() => setSelected(isSelected ? null : day)}
              className={`relative flex flex-col items-center rounded-xl py-2 px-1 transition-all min-h-[52px] ${
                isToday(day)
                  ? 'bg-white text-black'
                  : isSelected
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <span className={`text-xs font-medium mb-1 ${isToday(day) ? 'text-black' : ''}`}>
                {day}
              </span>
              {(taskCount > 0 || msCount > 0) && (
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {taskCount > 0 && (
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      hasOverdue ? 'bg-red-400' : isToday(day) ? 'bg-black/40' : 'bg-blue-400'
                    }`} />
                  )}
                  {msCount > 0 && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isToday(day) ? 'bg-black/40' : 'bg-yellow-400'}`} />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day details */}
      {selected && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <p className="text-xs text-white/50 mb-3 font-medium">
            {MONTHS[month]} {selected}, {year}
          </p>
          {!selectedItems && (
            <p className="text-xs text-white/25">No tasks or milestones due this day.</p>
          )}
          {selectedItems?.tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2 mb-2">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                t.status === 'done' ? 'bg-green-400' : new Date(t.due_date) < today ? 'bg-red-400' : 'bg-blue-400'
              }`} />
              <span className={`text-xs ${t.status === 'done' ? 'text-white/30 line-through' : 'text-white/80'}`}>
                {t.title}
              </span>
              <span className="ml-auto text-[9px] text-white/30 capitalize bg-white/[0.05] px-1.5 py-0.5 rounded">
                {(t.status || '').replace('_', ' ')}
              </span>
            </div>
          ))}
          {selectedItems?.milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-2 mb-2">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                m.completed ? 'bg-green-400' : new Date(m.due_date) < today ? 'bg-red-400' : 'bg-yellow-400'
              }`} />
              <span className={`text-xs ${m.completed ? 'text-white/30 line-through' : 'text-white/80'}`}>
                {m.title}
              </span>
              <span className="ml-auto text-[9px] text-yellow-400/60 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                milestone
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.05]">
        {[
          { cls: 'bg-blue-400', label: 'Task due' },
          { cls: 'bg-yellow-400', label: 'Milestone' },
          { cls: 'bg-red-400', label: 'Overdue' },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${cls}`} />
            <span className="text-[10px] text-white/30">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
