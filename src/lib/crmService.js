import { supabase } from './supabaseClient'
import { isoDay, nextMonth } from './crmUtils'

// Vikku CRM data access (admin-only; enforced by RLS in supabase/migrations/20261026_crm_phase1.sql).

export * from './crmUtils'

const check = ({ data, error }) => { if (error) throw error; return data }

// Leads
export const listLeads = async () => check(await supabase.from('crm_leads').select('*').order('updated_at', { ascending: false }))
export const createLead = async (fields) => check(await supabase.from('crm_leads').insert(fields).select().single())
export const updateLead = async (id, fields) => check(await supabase.from('crm_leads').update(fields).eq('id', id).select().single())
export const deleteLead = async (id) => check(await supabase.from('crm_leads').delete().eq('id', id))
export const convertLead = async (id) => check(await supabase.rpc('crm_convert_lead', { p_lead_id: id }))
// Bulk edits from the Leads board. Ids go in the query string, so they're sent 100 at a time.
const chunks = (ids, n = 100) => Array.from({ length: Math.ceil(ids.length / n) }, (_, i) => ids.slice(i * n, i * n + n))
export async function updateLeads(ids, fields) {
  const out = []
  for (const part of chunks(ids)) out.push(...check(await supabase.from('crm_leads').update(fields).in('id', part).select()))
  return out
}
export async function deleteLeads(ids) {
  for (const part of chunks(ids)) check(await supabase.from('crm_leads').delete().in('id', part))
}

// Clients
export const listClients = async () => check(await supabase.from('crm_clients').select('*').order('name'))
export const getClient = async (id) => check(await supabase.from('crm_clients').select('*').eq('id', id).single())
export const createClient = async (fields) => check(await supabase.from('crm_clients').insert(fields).select().single())
export const updateClient = async (id, fields) => check(await supabase.from('crm_clients').update(fields).eq('id', id).select().single())
export const deleteClient = async (id) => check(await supabase.from('crm_clients').delete().eq('id', id))

// Timeline. A client's timeline also shows the history of the lead it came from.
export async function listActivity({ leadId, clientId }) {
  let q = supabase.from('crm_activity').select('*').order('created_at', { ascending: false }).limit(200)
  if (clientId && leadId) q = q.or(`client_id.eq.${clientId},lead_id.eq.${leadId}`)
  else if (clientId) q = q.eq('client_id', clientId)
  else q = q.eq('lead_id', leadId)
  return check(await q)
}
export const addActivity = async (fields) => check(await supabase.from('crm_activity').insert(fields).select().single())

// ---- Phase 2: projects, payments, retainers, expenses ----
const list = (table, order, filters = {}, ascending = false) => {
  let q = supabase.from(table).select('*').order(order, { ascending, nullsFirst: false })
  for (const [col, val] of Object.entries(filters)) if (val) q = q.eq(col, val)
  return q
}

export const listProjects = async ({ clientId } = {}) => check(await list('crm_projects', 'updated_at', { client_id: clientId }))
export const createProject = async (fields) => check(await supabase.from('crm_projects').insert(fields).select().single())
export const updateProject = async (id, fields) => check(await supabase.from('crm_projects').update(fields).eq('id', id).select().single())
export const deleteProject = async (id) => check(await supabase.from('crm_projects').delete().eq('id', id))

export const listPayments = async ({ clientId, projectId } = {}) => check(await list('crm_payments', 'created_at', { client_id: clientId, project_id: projectId }))
export const createPayment = async (fields) => check(await supabase.from('crm_payments').insert(fields).select().single())
export const updatePayment = async (id, fields) => check(await supabase.from('crm_payments').update(fields).eq('id', id).select().single())
export const deletePayment = async (id) => check(await supabase.from('crm_payments').delete().eq('id', id))

export const listRetainers = async ({ clientId } = {}) => check(await list('crm_retainers', 'next_billing_date', { client_id: clientId }, true))
export const createRetainer = async (fields) => check(await supabase.from('crm_retainers').insert(fields).select().single())
export const updateRetainer = async (id, fields) => check(await supabase.from('crm_retainers').update(fields).eq('id', id).select().single())
export const deleteRetainer = async (id) => check(await supabase.from('crm_retainers').delete().eq('id', id))

export const listExpenses = async () => check(await list('crm_expenses', 'spent_on'))
export const createExpense = async (fields) => check(await supabase.from('crm_expenses').insert(fields).select().single())
export const deleteExpense = async (id) => check(await supabase.from('crm_expenses').delete().eq('id', id))

// Creates a Vikku PM board for a CRM project (owned by the signed-in admin) and links it.
export async function createPmBoard(project, client, userId) {
  if (!userId) throw new Error('Your session has expired. Sign in again to create a PM board.')
  const { createProject: createPmProject } = await import('./pmService')
  const board = await createPmProject({
    user_id: userId,
    name: project.name,
    description: project.notes || null,
    client_name: client?.company || client?.name || null,
    client_email: client?.email || null,
  })
  return updateProject(project.id, { pm_project_id: board.id })
}

// Logs this month's retainer as a received payment and moves the next billing date one month on.
export async function recordRetainerMonth(r) {
  await createPayment({ client_id: r.client_id, amount: r.amount, currency: r.currency, kind: 'retainer', status: 'received', paid_on: isoDay(), notes: r.title })
  return updateRetainer(r.id, { next_billing_date: nextMonth(r.next_billing_date || isoDay()) })
}

// ---- Phase 3: meetings, quotations ----
export const listMeetings = async ({ leadId, clientId } = {}) => check(await list('crm_meetings', 'starts_at', { lead_id: leadId, client_id: clientId }, true))
export const createMeeting = async (fields) => check(await supabase.from('crm_meetings').insert(fields).select().single())
export const updateMeeting = async (id, fields) => check(await supabase.from('crm_meetings').update(fields).eq('id', id).select().single())
export const deleteMeeting = async (id) => check(await supabase.from('crm_meetings').delete().eq('id', id))

export const listDocuments = async ({ clientId } = {}) => check(await list('crm_documents', 'created_at', { client_id: clientId }))
export const createDocument = async (fields) => check(await supabase.from('crm_documents').insert(fields).select().single())
export const updateDocument = async (id, fields) => check(await supabase.from('crm_documents').update(fields).eq('id', id).select().single())
export const deleteDocument = async (id) => check(await supabase.from('crm_documents').delete().eq('id', id))

// Latest CRM events across all leads and clients (admin home "Recent activity").
export const listRecentActivity = async (limit = 12) => check(await supabase.from('crm_activity').select('*').order('created_at', { ascending: false }).limit(limit))

// Linked Vikku PM boards for CRM projects: { [pm_project_id]: { slug, share_token, done, total, progress } }.
// The admin owns boards made with "Create PM board", so RLS lets these reads through.
export async function pmBoards(ids) {
  if (!ids.length) return {}
  const [boards, tasks] = await Promise.all([
    supabase.from('pm_projects').select('id, slug, share_token').in('id', ids),
    supabase.from('pm_tasks').select('project_id, status').in('project_id', ids),
  ])
  const out = {}
  for (const b of check(boards)) out[b.id] = { slug: b.slug, share_token: b.share_token, done: 0, total: 0, progress: 0 }
  for (const t of check(tasks)) {
    const b = out[t.project_id]
    if (!b) continue
    b.total++
    if (t.status === 'done') b.done++
  }
  for (const b of Object.values(out)) b.progress = b.total ? Math.round((b.done / b.total) * 100) : 0
  return out
}
export const pmShareLink = (token) => `https://www.vikku.in/pm/share/${token}`
