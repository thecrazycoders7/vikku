/**
 * Centralized feature entitlement system.
 *
 * Usage:
 *   import { can, requiresPro } from './entitlements'
 *   can(plan, 'customWorkflows')  → true / false
 *   requiresPro('customWorkflows') → true
 *
 * Add new features here as the product grows - never scatter plan checks
 * across components.
 */

const RULES = {
  // ── Pro features ─────────────────────────────────────────────────────────
  customWorkflows:    (p) => p === 'pro' || p === 'team',
  workflowTemplates:  (p) => p === 'pro' || p === 'team',
  cloneWorkflow:      (p) => p === 'pro' || p === 'team',
  timeTracking:       (p) => p === 'pro' || p === 'team',
  taskTimer:          (p) => p === 'pro' || p === 'team',
  timeReports:        (p) => p === 'pro' || p === 'team',
  billableTracking:   (p) => p === 'pro' || p === 'team',
  timeExport:         (p) => p === 'pro' || p === 'team',
  clientShare:        (p) => p === 'pro' || p === 'team',
  clientBranding:     (p) => p === 'pro' || p === 'team',
  emailReminders:     (p) => p === 'pro' || p === 'team',
  milestoneApprovals: (p) => p === 'pro' || p === 'team',
  csvExport:          (p) => p === 'pro' || p === 'team',
  // aiPlanner: 6 free uses/month, unlimited Pro (handled separately in AIAssistant)
  aiPlannerUnlimited: (p) => p === 'pro' || p === 'team',

  // ── Team-only features ────────────────────────────────────────────────────
  teamMembers:        (p) => p === 'team',
  roleAccess:         (p) => p === 'team',
  projectDuplication: (p) => p === 'team',

  // ── Free features (always allowed) ───────────────────────────────────────
  kanban:         () => true,
  analytics:      () => true,
  calendar:       () => true,
  timeline:       () => true,
  milestones:     () => true,
  taskLabels:     () => true,
  dueDates:       () => true,
  pdfExport:      () => true,
  basicTimeLog:   () => true,   // manual minute-logging is free; timer/reports are Pro
  quickAdd:       () => true,
}

/**
 * Returns true if the given plan can use the given feature.
 * @param {string} plan  – 'free' | 'pro' | 'team'
 * @param {string} feature – key from RULES above
 */
export function can(plan, feature) {
  const rule = RULES[feature]
  if (!rule) {
    console.warn(`[entitlements] Unknown feature: "${feature}"`)
    return false
  }
  return rule(plan ?? 'free')
}

/**
 * Returns true if the feature is behind a Pro (or higher) gate.
 */
export function requiresPro(feature) {
  return !can('free', feature)
}

export const STORAGE_LIMITS_MB = { free: 200, pro: 2048, team: 10240 }
