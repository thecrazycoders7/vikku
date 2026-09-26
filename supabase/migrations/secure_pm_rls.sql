-- ============================================================================
-- SECURITY FIX: lock down Row-Level Security on the PM tables.
--
-- Before this, pm_* rows were readable by anyone (even anonymous) through the
-- public API — any project/task/client data could be read without logging in.
-- This restricts access to the project OWNER and invited MEMBERS, and moves the
-- public client-share (share_token) access to SECURITY DEFINER functions so the
-- client view keeps working without opening the tables to everyone.
--
-- Safe to run more than once (idempotent). Run in the Supabase SQL editor.
-- ============================================================================

-- Owner-or-member check. SECURITY DEFINER so it bypasses RLS internally and
-- doesn't cause policy recursion between pm_projects and pm_project_members.
create or replace function pm_can_access_project(p_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from pm_projects        p where p.id = p_id and p.user_id = auth.uid())
      or exists (select 1 from pm_project_members m where m.project_id = p_id and m.user_id = auth.uid());
$$;

-- Drop ALL existing policies on these tables (a leftover permissive policy would
-- otherwise still grant access, since policies are OR'd), enable RLS, recreate.
do $$
declare r record; t text;
begin
  foreach t in array array[
    'pm_projects','pm_tasks','pm_milestones','pm_project_members','pm_client_comments','pm_invoices'
  ] loop
    if to_regclass('public.'||t) is null then continue; end if;
    for r in select policyname from pg_policies where schemaname='public' and tablename=t loop
      execute format('drop policy %I on public.%I', r.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- pm_projects: read = owner/member, write = owner only
create policy pm_projects_select on pm_projects for select using (pm_can_access_project(id));
create policy pm_projects_insert on pm_projects for insert with check (user_id = auth.uid());
create policy pm_projects_update on pm_projects for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy pm_projects_delete on pm_projects for delete using (user_id = auth.uid());

-- pm_tasks / pm_milestones / pm_invoices: owner + members
create policy pm_tasks_all on pm_tasks for all
  using (pm_can_access_project(project_id)) with check (pm_can_access_project(project_id));
create policy pm_milestones_all on pm_milestones for all
  using (pm_can_access_project(project_id)) with check (pm_can_access_project(project_id));
create policy pm_invoices_all on pm_invoices for all
  using (pm_can_access_project(project_id)) with check (pm_can_access_project(project_id));

-- pm_project_members: read = owner/member; add/remove members = owner only
create policy pm_members_select on pm_project_members for select using (pm_can_access_project(project_id));
create policy pm_members_write on pm_project_members for all
  using (exists (select 1 from pm_projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (exists (select 1 from pm_projects p where p.id = project_id and p.user_id = auth.uid()));

-- pm_client_comments: owner/member can read (clients post via add_shared_comment below)
create policy pm_client_comments_select on pm_client_comments for select using (pm_can_access_project(project_id));

-- ── Public client-share access (anon), via SECURITY DEFINER functions ────────
-- These bypass RLS but only ever return rows for the project matching the token.

create or replace function get_shared_project(p_token uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select (to_jsonb(p) - 'share_pin') || jsonb_build_object('has_share_pin', p.share_pin is not null)
  from pm_projects p where p.share_token = p_token;
$$;

create or replace function get_shared_tasks(p_token uuid)
returns setof pm_tasks language sql stable security definer set search_path = public as $$
  select t.* from pm_tasks t join pm_projects p on p.id = t.project_id
  where p.share_token = p_token
  order by t.position asc nulls last, t.created_at asc;
$$;

create or replace function get_shared_milestones(p_token uuid)
returns setof pm_milestones language sql stable security definer set search_path = public as $$
  select m.* from pm_milestones m join pm_projects p on p.id = m.project_id
  where p.share_token = p_token
  order by m.due_date asc nulls last;
$$;

create or replace function get_shared_comments(p_token uuid)
returns setof pm_client_comments language sql stable security definer set search_path = public as $$
  select c.* from pm_client_comments c where c.share_token = p_token order by c.created_at asc;
$$;

create or replace function add_shared_comment(p_token uuid, p_author text, p_content text)
returns pm_client_comments language plpgsql security definer set search_path = public as $$
declare v_project uuid; v_row pm_client_comments;
begin
  select id into v_project from pm_projects where share_token = p_token;
  if v_project is null then raise exception 'invalid share token'; end if;
  insert into pm_client_comments (project_id, share_token, author_name, content)
  values (v_project, p_token, left(coalesce(p_author,''),120), left(coalesce(p_content,''),4000))
  returning * into v_row;
  return v_row;
end $$;

create or replace function approve_milestone_client(p_milestone_id uuid, p_token uuid, p_status text, p_note text default null)
returns pm_milestones language plpgsql security definer set search_path = public as $$
declare v_row pm_milestones;
begin
  if p_status not in ('approved','rejected','pending') then raise exception 'bad status'; end if;
  update pm_milestones m
     set approval_status = p_status, client_note = left(p_note, 2000)
    from pm_projects p
   where m.id = p_milestone_id and p.id = m.project_id and p.share_token = p_token
  returning m.* into v_row;
  if v_row.id is null then raise exception 'milestone not found for token'; end if;
  return v_row;
end $$;

grant execute on function
  get_shared_project(uuid), get_shared_tasks(uuid), get_shared_milestones(uuid),
  get_shared_comments(uuid), add_shared_comment(uuid,text,text),
  approve_milestone_client(uuid,uuid,text,text)
  to anon, authenticated;
