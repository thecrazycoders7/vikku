import { supabase } from './supabaseClient'

// ── Projects ──────────────────────────────────────────────

export async function getProjects(userId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching projects:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Failed to fetch projects:', err)
    return []
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function generateProjectSlug(name, id) {
  const base = (name || 'project')
    .slice(0, 46)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'project'
  return `${base}-${id.slice(0, 4)}`
}

export async function getProject(idOrSlug) {
  if (!supabase) return null
  try {
    const field = UUID_RE.test(idOrSlug) ? 'id' : 'slug'
    const { data, error } = await supabase
      .from('pm_projects')
      .select('*')
      .eq(field, idOrSlug)
      .single()
    if (error) {
      console.error('Error fetching project:', error)
      return null
    }
    return data
  } catch (err) {
    console.error('Failed to fetch project:', err)
    return null
  }
}

export async function getProjectByToken(token) {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('pm_projects')
      .select('*')
      .eq('share_token', token)
      .single()
    if (error) {
      // PGRST116 = no matching row, 22P02 = token isn't a valid uuid; both just mean "bad link"
      if (error.code !== 'PGRST116' && error.code !== '22P02') {
        console.error('Error fetching project by token:', error.message)
      }
      return null
    }
    // Strip PIN from client response; expose only whether one is set
    const { share_pin, ...rest } = data
    return { ...rest, has_share_pin: !!share_pin }
  } catch (err) {
    console.error('Failed to fetch project by token:', err)
    return null
  }
}

export async function createProject(fields) {
  if (!supabase) throw new Error('Database not configured')
  const id = crypto.randomUUID()
  const slug = generateProjectSlug(fields.name, id)
  const { data, error } = await supabase
    .from('pm_projects')
    .insert({ ...fields, id, slug })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProject(id, fields) {
  if (!supabase) throw new Error('Database not configured')

  // share_pin must be hashed server-side via set_share_pin RPC - never written directly.
  if ('share_pin' in fields) {
    const pin = fields.share_pin
    const { error: pinErr } = await supabase.rpc('set_share_pin', {
      p_project_id: id,
      p_pin: pin ?? '',
    })
    if (pinErr) throw pinErr
    const { share_pin: _omit, ...rest } = fields
    if (Object.keys(rest).length === 0) {
      // Nothing else to update - return current project row
      const { data, error } = await supabase.from('pm_projects').select().eq('id', id).single()
      if (error) throw error
      const { share_pin, ...safeData } = data
      return { ...safeData, has_share_pin: !!share_pin }
    }
    fields = rest
  }

  const { data, error } = await supabase
    .from('pm_projects')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(id) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_projects').delete().eq('id', id).select('id')
  if (error) throw error
  // RLS filters deletes silently for non-owners (0 rows, no error)
  if (!data?.length) throw new Error("Project couldn't be deleted - only the owner can delete it")
}

// ── Tasks ──────────────────────────────────────────────────

export async function getTasks(projectId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) {
      console.error('Error fetching tasks:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Failed to fetch tasks:', err)
    return []
  }
}

export async function createTask(fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_tasks')
    .insert(fields)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTask(id, fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_tasks')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTask(id) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_tasks').delete().eq('id', id).select('id')
  if (error) throw error
  // RLS can filter a delete silently (0 rows affected, no error); surface it
  // so the UI doesn't remove a task that still exists on the server
  if (!data?.length) throw new Error("Task couldn't be deleted - you may not have permission")
}

export async function bulkCreateTasks(tasks) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_tasks').insert(tasks).select()
  if (error) throw error
  return data
}

// ── Milestones ─────────────────────────────────────────────

export async function getMilestones(projectId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('due_date', { ascending: true })
    if (error) {
      console.error('Error fetching milestones:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Failed to fetch milestones:', err)
    return []
  }
}

export async function createMilestone(fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_milestones')
    .insert(fields)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateMilestone(id, fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_milestones')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMilestone(id) {
  if (!supabase) throw new Error('Database not configured')
  const { error } = await supabase.from('pm_milestones').delete().eq('id', id)
  if (error) throw error
}

export async function bulkCreateMilestones(milestones) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_milestones').insert(milestones).select()
  if (error) throw error
  return data
}

// ── Project Members ────────────────────────────────────────

export async function getProjectMembers(projectId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_project_members')
      .select('*')
      .eq('project_id', projectId)
      .order('joined_at', { ascending: true })
    if (error) {
      console.error('Error fetching members:', error)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Failed to fetch members:', err)
    return []
  }
}

export async function joinProject(projectId, userId, email, role = 'member') {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_project_members')
    .insert({ project_id: projectId, user_id: userId, email, role })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeProjectMember(memberId) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_project_members').delete().eq('id', memberId).select('id')
  if (error) throw error
  // RLS filters deletes silently for non-owners (0 rows, no error)
  if (!data?.length) throw new Error("Member couldn't be removed - only the owner can manage members")
}

// Calls a SECURITY DEFINER RPC so any authenticated user can read the owner's plan.
// Run the SQL in supabase/migrations/get_project_member_limit.sql to create the function.
export async function getProjectMemberLimit(projectId) {
  if (!supabase) return { plan: 'free', limit: 3 }
  try {
    const { data, error } = await supabase.rpc('get_project_member_limit', { p_project_id: projectId })
    if (error) throw error
    return data ?? { plan: 'free', limit: 3 }
  } catch (err) {
    console.error('get_project_member_limit RPC failed:', err)
    return { plan: 'free', limit: 3 }
  }
}

export async function getSharedProjects(userId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_project_members')
      .select('project_id, pm_projects(*)')
      .eq('user_id', userId)
    if (error) {
      console.error('Error fetching shared projects:', error)
      return []
    }
    return data.map((row) => row.pm_projects).filter(Boolean)
  } catch (err) {
    console.error('Failed to fetch shared projects:', err)
    return []
  }
}

// ── Task Comments ──────────────────────────────────────────

export async function getTaskComments(taskId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    if (error) { console.error('Error fetching comments:', error); return [] }
    return data || []
  } catch (err) { return [] }
}

export async function createTaskComment(fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_task_comments')
    .insert(fields)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTaskComment(id) {
  if (!supabase) throw new Error('Database not configured')
  const { error } = await supabase.from('pm_task_comments').delete().eq('id', id)
  if (error) throw error
}

// ── Activity Feed ──────────────────────────────────────────

export async function getProjectActivity(projectId, limit = 20) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_activity')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) { console.error('Error fetching activity:', error); return [] }
    return data || []
  } catch (err) { return [] }
}

export async function getEntityActivity(entityId) {
  if (!supabase || !entityId) return []
  try {
    const { data, error } = await supabase
      .from('pm_activity')
      .select('*')
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
    if (error) { console.error('Error fetching entity activity:', error); return [] }
    return data || []
  } catch (err) { return [] }
}

export async function logActivity(fields) {
  if (!supabase) return
  try {
    await supabase.from('pm_activity').insert(fields)
  } catch (err) {
    console.error('Failed to log activity:', err)
  }
}

// ── Subtasks ───────────────────────────────────────────────

export async function getSubtaskCounts(taskIds) {
  if (!supabase || !taskIds.length) return {}
  try {
    const { data } = await supabase
      .from('pm_subtasks')
      .select('task_id, completed')
      .in('task_id', taskIds)
    const map = {}
    ;(data || []).forEach((s) => {
      if (!map[s.task_id]) map[s.task_id] = { total: 0, done: 0 }
      map[s.task_id].total++
      if (s.completed) map[s.task_id].done++
    })
    return map
  } catch { return {} }
}

export async function getSubtasks(taskId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase.from('pm_subtasks').select('*').eq('task_id', taskId).order('created_at', { ascending: true })
    if (error) { console.error(error); return [] }
    return data || []
  } catch { return [] }
}

export async function createSubtask(fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_subtasks').insert(fields).select().single()
  if (error) throw error
  return data
}

export async function updateSubtask(id, fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_subtasks').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteSubtask(id) {
  if (!supabase) throw new Error('Database not configured')
  const { error } = await supabase.from('pm_subtasks').delete().eq('id', id)
  if (error) throw error
}

// ── Time Logs ──────────────────────────────────────────────

export async function getTimeLogs(taskId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase.from('pm_time_logs').select('*').eq('task_id', taskId).order('created_at', { ascending: false })
    if (error) { console.error(error); return [] }
    return data || []
  } catch { return [] }
}

export async function createTimeLog(fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_time_logs').insert(fields).select().single()
  if (error) throw error
  return data
}

export async function deleteTimeLog(id) {
  if (!supabase) throw new Error('Database not configured')
  const { error } = await supabase.from('pm_time_logs').delete().eq('id', id)
  if (error) throw error
}

export async function getProjectTimeLogs(projectId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase.from('pm_time_logs').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
    if (error) { console.error(error); return [] }
    return data || []
  } catch { return [] }
}

// ── Project Duplication ────────────────────────────────────────

export async function duplicateProject(projectId) {
  if (!supabase) throw new Error('Database not configured')
  const { data: orig, error: pe } = await supabase.from('pm_projects').select('*').eq('id', projectId).single()
  if (pe || !orig) throw new Error('Project not found')
  const newId = crypto.randomUUID()
  const slug = generateProjectSlug(`${orig.name} copy`, newId)
  const { data: newProject, error: ne } = await supabase
    .from('pm_projects')
    .insert({
      id: newId, slug,
      user_id: orig.user_id, name: `${orig.name} (copy)`, description: orig.description,
      status: 'active', client_name: orig.client_name, client_email: orig.client_email, color: orig.color,
    })
    .select().single()
  if (ne) throw ne
  const { data: tasks } = await supabase.from('pm_tasks').select('*').eq('project_id', projectId)
  if (tasks && tasks.length > 0) {
    await supabase.from('pm_tasks').insert(
      tasks.map((t) => ({
        project_id: newProject.id, title: t.title, description: t.description,
        status: t.status, priority: t.priority, due_date: t.due_date,
        label: t.label, task_link: t.task_link,
      }))
    )
  }
  const { data: milestones } = await supabase.from('pm_milestones').select('*').eq('project_id', projectId)
  if (milestones && milestones.length > 0) {
    await supabase.from('pm_milestones').insert(
      milestones.map((m) => ({ project_id: newProject.id, title: m.title, due_date: m.due_date, completed: false }))
    )
  }
  return { ...newProject, slug }
}

// ── Task Attachments ───────────────────────────────────────────

export async function getTaskAttachments(taskId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_task_attachments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
    if (error) { console.error(error); return [] }
    return data || []
  } catch { return [] }
}

export async function uploadTaskAttachment(taskId, userId, file) {
  if (!supabase) throw new Error('Database not configured')
  const ext = file.name.split('.').pop()
  const filePath = `${userId}/${taskId}/${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('pm-attachments')
    .upload(filePath, file, { contentType: file.type, upsert: false })
  if (uploadError) throw uploadError
  const { data, error } = await supabase
    .from('pm_task_attachments')
    .insert({ task_id: taskId, user_id: userId, file_name: file.name, file_path: filePath, file_size: file.size, mime_type: file.type })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTaskAttachment(id, filePath) {
  if (!supabase) throw new Error('Database not configured')
  await supabase.storage.from('pm-attachments').remove([filePath])
  const { error } = await supabase.from('pm_task_attachments').delete().eq('id', id)
  if (error) throw error
}

export async function getAttachmentUrl(filePath) {
  if (!supabase) return null
  const { data } = await supabase.storage.from('pm-attachments').createSignedUrl(filePath, 3600)
  return data?.signedUrl || null
}

export async function getProjectAttachments(projectId) {
  if (!supabase) return []
  try {
    const { data: tasks } = await supabase.from('pm_tasks').select('id, title').eq('project_id', projectId)
    if (!tasks?.length) return []
    const taskMap = Object.fromEntries(tasks.map(t => [t.id, t.title]))
    const { data, error } = await supabase
      .from('pm_task_attachments')
      .select('*')
      .in('task_id', tasks.map(t => t.id))
      .order('created_at', { ascending: false })
    if (error) { console.error(error); return [] }
    return (data || []).map(a => ({ ...a, task_title: taskMap[a.task_id] || '' }))
  } catch { return [] }
}

export async function getStorageUsedMb(userId) {
  if (!supabase || !userId) return 0
  try {
    const { data } = await supabase
      .from('pm_task_attachments')
      .select('file_size')
      .eq('user_id', userId)
    if (!data?.length) return 0
    const totalBytes = data.reduce((s, r) => s + (r.file_size || 0), 0)
    return Math.round((totalBytes / (1024 * 1024)) * 10) / 10
  } catch { return 0 }
}

export async function toggleAttachmentVisibility(id, visible) {
  if (!supabase) return
  await supabase.from('pm_task_attachments').update({ visible_to_client: visible }).eq('id', id)
}

export async function getClientVisibleAttachments(projectId) {
  if (!supabase) return []
  try {
    const { data: tasks } = await supabase.from('pm_tasks').select('id').eq('project_id', projectId)
    if (!tasks?.length) return []
    const { data, error } = await supabase
      .from('pm_task_attachments')
      .select('*')
      .in('task_id', tasks.map(t => t.id))
      .eq('visible_to_client', true)
      .order('created_at', { ascending: false })
    if (error) { console.error(error); return [] }
    return data || []
  } catch { return [] }
}

// ── Client Comments ────────────────────────────────────────────

export async function getClientComments(shareToken) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_client_comments').select('*').eq('share_token', shareToken)
      .order('created_at', { ascending: true })
    if (error) { console.error(error); return [] }
    return data || []
  } catch { return [] }
}

export async function createClientComment(fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_client_comments').insert(fields).select().single()
  if (error) throw error
  return data
}

// ── Workflows ──────────────────────────────────────────────────────────────────

export async function getWorkflows(userId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_workflows')
      .select('*, pm_workflow_stages(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) { console.error('getWorkflows:', error); return [] }
    return (data || []).map((w) => ({
      ...w,
      stages: (w.pm_workflow_stages || []).sort((a, b) => a.position - b.position),
    }))
  } catch (err) { console.error(err); return [] }
}

export async function getWorkflow(workflowId) {
  if (!supabase || !workflowId) return null
  try {
    const { data, error } = await supabase
      .from('pm_workflows')
      .select('*, pm_workflow_stages(*)')
      .eq('id', workflowId)
      .single()
    if (error) { console.error('getWorkflow:', error); return null }
    return { ...data, stages: (data.pm_workflow_stages || []).sort((a, b) => a.position - b.position) }
  } catch { return null }
}

export async function createWorkflow(userId, name, stages = []) {
  if (!supabase) throw new Error('Database not configured')
  const { data: wf, error: we } = await supabase
    .from('pm_workflows')
    .insert({ user_id: userId, name })
    .select()
    .single()
  if (we) throw we
  if (stages.length > 0) {
    const { error: se } = await supabase.from('pm_workflow_stages').insert(
      stages.map((s, i) => ({ workflow_id: wf.id, name: s.name, color: s.color, position: i * 100, is_done: s.is_done || false, status_key: s.status_key }))
    )
    if (se) throw se
  }
  return getWorkflow(wf.id)
}

export async function updateWorkflowName(id, name) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_workflows')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteWorkflow(id) {
  if (!supabase) throw new Error('Database not configured')
  const { error } = await supabase.from('pm_workflows').delete().eq('id', id)
  if (error) throw error
}

export async function saveWorkflowStages(workflowId, stages) {
  if (!supabase) throw new Error('Database not configured')
  await supabase.from('pm_workflow_stages').delete().eq('workflow_id', workflowId)
  if (!stages.length) return []
  const { data, error } = await supabase
    .from('pm_workflow_stages')
    .insert(stages.map((s, i) => ({
      workflow_id: workflowId,
      name:       s.name,
      color:      s.color,
      position:   i * 100,
      is_done:    s.is_done || false,
      status_key: s.status_key,
    })))
    .select()
  if (error) throw error
  return data
}

export async function migrateTaskStatuses(projectId, statusMap) {
  // statusMap: { old_key: new_key, ... }
  if (!supabase) throw new Error('Database not configured')
  const entries = Object.entries(statusMap).filter(([o, n]) => o !== n)
  if (!entries.length) return
  const results = await Promise.all(
    entries.map(([oldKey, newKey]) =>
      supabase.from('pm_tasks').update({ status: newKey }).eq('project_id', projectId).eq('status', oldKey)
    )
  )
  const failed = results.find((r) => r.error)
  if (failed) throw failed.error
}

// ── Extended Time Tracking ─────────────────────────────────────────────────────

export async function startTimer(taskId, projectId, userId, userEmail) {
  if (!supabase) throw new Error('Database not configured')
  // Stop any already-running timers for this user first
  const { data: running } = await supabase
    .from('pm_time_logs')
    .select('id, start_time')
    .eq('user_id', userId)
    .eq('is_running', true)
  if (running?.length) {
    await Promise.all(running.map((r) => {
      const mins = Math.max(1, Math.round((Date.now() - new Date(r.start_time).getTime()) / 60000))
      return supabase.from('pm_time_logs').update({ is_running: false, end_time: new Date().toISOString(), minutes: mins }).eq('id', r.id)
    }))
  }
  const { data, error } = await supabase
    .from('pm_time_logs')
    .insert({ task_id: taskId, project_id: projectId, user_id: userId, user_email: userEmail, minutes: 0, is_running: true, start_time: new Date().toISOString(), billable: true })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function stopTimer(logId) {
  if (!supabase) throw new Error('Database not configured')
  const { data: log, error: fe } = await supabase.from('pm_time_logs').select('start_time').eq('id', logId).single()
  if (fe) throw fe
  const mins = Math.max(1, Math.round((Date.now() - new Date(log.start_time).getTime()) / 60000))
  const { data, error } = await supabase
    .from('pm_time_logs')
    .update({ is_running: false, end_time: new Date().toISOString(), minutes: mins })
    .eq('id', logId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getRunningTimer(taskId, userId) {
  if (!supabase) return null
  try {
    const { data } = await supabase
      .from('pm_time_logs')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', userId)
      .eq('is_running', true)
      .maybeSingle()
    return data || null
  } catch { return null }
}

export async function updateTimeLog(id, fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('pm_time_logs')
    .update(fields)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Task Dependencies ───────────────────────────────────────

export async function getTaskDependencies(taskId) {
  if (!supabase) return []
  const { data } = await supabase.from('pm_task_dependencies').select('depends_on_task_id').eq('task_id', taskId)
  return data || []
}

export async function getProjectDependencies(projectId) {
  if (!supabase) return []
  const { data } = await supabase.from('pm_task_dependencies').select('task_id, depends_on_task_id').eq('project_id', projectId)
  return data || []
}

export async function addTaskDependency(taskId, dependsOnTaskId, projectId) {
  if (!supabase) throw new Error('Database not configured')
  const { error } = await supabase.from('pm_task_dependencies').insert({ task_id: taskId, depends_on_task_id: dependsOnTaskId, project_id: projectId })
  if (error) throw error
}

export async function removeTaskDependency(taskId, dependsOnTaskId) {
  if (!supabase) throw new Error('Database not configured')
  const { error } = await supabase.from('pm_task_dependencies').delete().eq('task_id', taskId).eq('depends_on_task_id', dependsOnTaskId)
  if (error) throw error
}

// ── Share PIN ────────────────────────────────────────────────

export async function verifySharePin(token, pin) {
  if (!supabase) return false
  const { data, error } = await supabase.rpc('verify_share_pin', { p_token: token, p_pin: pin })
  if (error) throw error
  return !!data
}

// ── Client task approval ─────────────────────────────────────

export async function approveTaskAsClient(taskId, shareToken, status, note = null) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.rpc('approve_task_client', {
    p_task_id: taskId, p_share_token: shareToken, p_status: status, p_note: note,
  })
  if (error) throw error
  return data
}

// ── Invoices ──────────────────────────────────────────────────

export async function saveInvoice(fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_invoices').insert(fields).select().single()
  if (error) throw error
  return data
}

export async function getInvoices(projectId) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('pm_invoices')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

export async function getProjectLabels(projectId) {
  if (!supabase) return []
  const { data } = await supabase.from('pm_projects').select('labels').eq('id', projectId).single()
  return data?.labels ?? []
}

export async function saveProjectLabels(projectId, labels) {
  if (!supabase) return
  await supabase.from('pm_projects').update({ labels }).eq('id', projectId)
}

// ── Filter presets ────────────────────────────────────────

export async function getFilterPresets(userId, projectId) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('pm_filter_presets')
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
    if (error) { console.error('Error fetching filter presets:', error); return [] }
    return data || []
  } catch (err) { return [] }
}

export async function createFilterPreset(fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_filter_presets').insert(fields).select().single()
  if (error) throw error
  return data
}

export async function updateFilterPreset(id, fields) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase.from('pm_filter_presets').update(fields).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteFilterPreset(id) {
  if (!supabase) throw new Error('Database not configured')
  const { error } = await supabase.from('pm_filter_presets').delete().eq('id', id)
  if (error) throw error
}
