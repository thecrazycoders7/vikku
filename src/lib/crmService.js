import { supabase } from './supabaseClient'

// Vikku CRM data access (admin-only; enforced by RLS in supabase/migrations/20261026_crm_phase1.sql).

export * from './crmUtils'

const check = ({ data, error }) => { if (error) throw error; return data }

// Leads
export const listLeads = async () => check(await supabase.from('crm_leads').select('*').order('updated_at', { ascending: false }))
export const createLead = async (fields) => check(await supabase.from('crm_leads').insert(fields).select().single())
export const updateLead = async (id, fields) => check(await supabase.from('crm_leads').update(fields).eq('id', id).select().single())
export const deleteLead = async (id) => check(await supabase.from('crm_leads').delete().eq('id', id))
export const convertLead = async (id) => check(await supabase.rpc('crm_convert_lead', { p_lead_id: id }))

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
