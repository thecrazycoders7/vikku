export const TASK_LABELS = ['Design', 'Dev', 'Bug', 'Review', 'Content', 'Meeting', 'Research']

// Assignees as an array, back-compat with the legacy single assigned_to_email
// column (works whether a task row is migrated to assigned_to_emails or not).
export const taskAssignees = (t) =>
  t?.assigned_to_emails?.length ? t.assigned_to_emails
  : (t?.assigned_to_email ? [t.assigned_to_email] : [])

export const DEFAULT_LABELS = [
  { name: 'Design',   color: '#8b5cf6' },
  { name: 'Dev',      color: '#3b82f6' },
  { name: 'Bug',      color: '#ef4444' },
  { name: 'Review',   color: '#eab308' },
  { name: 'Content',  color: '#22c55e' },
  { name: 'Meeting',  color: '#f97316' },
  { name: 'Research', color: '#06b6d4' },
]

export const LABEL_COLORS = [
  '#8b5cf6', '#3b82f6', '#ef4444', '#eab308', '#22c55e',
  '#f97316', '#06b6d4', '#ec4899', '#f59e0b', '#10b981',
]

/** Returns inline style object for a label, checking project labels then defaults. */
export function getLabelStyle(name, projectLabels = []) {
  const pool = projectLabels && projectLabels.length > 0 ? projectLabels : DEFAULT_LABELS
  const found = pool.find((l) => l.name === name)
  if (!found) return null
  return { bg: `${found.color}25`, color: found.color, border: `${found.color}50` }
}

export const LABEL_STYLES = {
  Design:   { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/20', dot: 'bg-purple-400' },
  Dev:      { bg: 'bg-blue-500/20',   text: 'text-blue-400',   border: 'border-blue-500/20',   dot: 'bg-blue-400' },
  Bug:      { bg: 'bg-red-500/20',    text: 'text-red-400',    border: 'border-red-500/20',    dot: 'bg-red-400' },
  Review:   { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-400' },
  Content:  { bg: 'bg-green-500/20',  text: 'text-green-400',  border: 'border-green-500/20',  dot: 'bg-green-400' },
  Meeting:  { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-400' },
  Research: { bg: 'bg-cyan-500/20',   text: 'text-cyan-400',   border: 'border-cyan-500/20',   dot: 'bg-cyan-400' },
}

// ── Workflow system ───────────────────────────────────────────────────────────

export const DEFAULT_WORKFLOW_STAGES = [
  { status_key: 'todo',        name: 'To Do',       color: '#6b7280', is_done: false, position: 0 },
  { status_key: 'in_progress', name: 'In Progress', color: '#3b82f6', is_done: false, position: 1 },
  { status_key: 'review',      name: 'Review',      color: '#eab308', is_done: false, position: 2 },
  { status_key: 'done',        name: 'Done',        color: '#22c55e', is_done: true,  position: 3 },
]

export const WORKFLOW_TEMPLATES = [
  {
    name: 'Software Development',
    description: 'From backlog to production',
    icon: '💻',
    stages: [
      { name: 'Backlog',     color: '#6b7280', is_done: false },
      { name: 'Design',      color: '#8b5cf6', is_done: false },
      { name: 'Development', color: '#3b82f6', is_done: false },
      { name: 'QA',          color: '#f59e0b', is_done: false },
      { name: 'UAT',         color: '#f97316', is_done: false },
      { name: 'Production',  color: '#22c55e', is_done: true  },
    ],
  },
  {
    name: 'Marketing Campaign',
    description: 'From idea to publication',
    icon: '📢',
    stages: [
      { name: 'Idea',      color: '#8b5cf6', is_done: false },
      { name: 'Writing',   color: '#3b82f6', is_done: false },
      { name: 'Design',    color: '#ec4899', is_done: false },
      { name: 'Review',    color: '#f59e0b', is_done: false },
      { name: 'Scheduled', color: '#f97316', is_done: false },
      { name: 'Published', color: '#22c55e', is_done: true  },
    ],
  },
  {
    name: 'Recruitment Pipeline',
    description: 'From application to hire',
    icon: '🧑‍💼',
    stages: [
      { name: 'Applied',   color: '#6b7280', is_done: false },
      { name: 'Screening', color: '#3b82f6', is_done: false },
      { name: 'Interview', color: '#8b5cf6', is_done: false },
      { name: 'Offer',     color: '#f59e0b', is_done: false },
      { name: 'Hired',     color: '#22c55e', is_done: true  },
    ],
  },
  {
    name: 'Content Production',
    description: 'Plan, create, publish',
    icon: '✍️',
    stages: [
      { name: 'Planned',    color: '#6b7280', is_done: false },
      { name: 'Drafting',   color: '#3b82f6', is_done: false },
      { name: 'Editing',    color: '#8b5cf6', is_done: false },
      { name: 'Approval',   color: '#f59e0b', is_done: false },
      { name: 'Published',  color: '#22c55e', is_done: true  },
    ],
  },
]

export const STAGE_COLORS = [
  '#6b7280', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#f43f5e',
  '#a855f7', '#10b981', '#ef4444', '#0ea5e9', '#d97706',
]

/** Generate a collision-free slug from a stage name */
export function generateStatusKey(name, existingKeys = []) {
  const base = (name || 'stage')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 25) || 'stage'
  let key = base
  let n = 2
  while (existingKeys.includes(key)) key = `${base}_${n++}`
  return key
}

/** Format minutes → "2h 30m" */
export function formatMinutes(mins) {
  if (!mins || mins <= 0) return '0m'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
