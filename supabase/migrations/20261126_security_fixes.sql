-- ============================================================================
-- Security fixes from the 2026-11-26 audit. Run once in the Supabase SQL editor,
-- BEFORE deploying the get-client-file edge function and the site change.
-- Safe to run more than once.
--
--  1. pm_time_logs was readable by anyone with the public key. Rebuild its policies:
--     project owner/members read, users write only their own rows.
--  2. The client share PIN was only checked in the browser. Every client-share
--     function now takes p_pin and refuses (or returns nothing) without the right PIN.
--     Wrong guesses are limited to 10 per 15 minutes per share link.
--  3. ai_rate_hit and get_email_pref are only called by edge functions with the
--     service role, so anonymous visitors can no longer call them.
-- ============================================================================

-- ------------------------------------------------------------ 1. time logs ---
do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'pm_time_logs' loop
    execute format('drop policy %I on public.pm_time_logs', pol.policyname);
  end loop;
end $$;

alter table pm_time_logs enable row level security;
revoke all on pm_time_logs from anon;

create policy pm_time_logs_select on pm_time_logs for select to authenticated
  using (pm_can_access_project(project_id));
create policy pm_time_logs_insert on pm_time_logs for insert to authenticated
  with check (user_id = auth.uid() and pm_can_access_project(project_id));
create policy pm_time_logs_update on pm_time_logs for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy pm_time_logs_delete on pm_time_logs for delete to authenticated
  using (user_id = auth.uid());

-- -------------------------------------------------------------- 2. share PIN ---
-- True when the project has no PIN or p_pin matches it. Handles bcrypt hashes (set_share_pin)
-- and any older plain-text PINs. Wrong guesses count towards a lock of 10 per 15 minutes.
create or replace function pm_share_pin_ok(p_token uuid, p_pin text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare
  v_hash text;
  v_found boolean;
  v_ok boolean;
begin
  select share_pin, true into v_hash, v_found from pm_projects where share_token = p_token;
  if not coalesce(v_found, false) then return false; end if;
  if v_hash is null then return true; end if;
  if p_pin is null or p_pin = '' then return false; end if;
  if exists (select 1 from ai_rate_limits where bucket = 'pin:' || p_token and expires_at > now() and count >= 10) then
    raise exception 'too many attempts' using errcode = 'P0001';
  end if;
  v_ok := case when v_hash like '$2%' then crypt(p_pin, v_hash) = v_hash else v_hash = p_pin end;
  if not v_ok then perform ai_rate_hit('pin:' || p_token, 10, 900); end if;
  return v_ok;
end $$;
revoke all on function pm_share_pin_ok(uuid, text) from public, anon, authenticated;

create or replace function verify_share_pin(p_token text, p_pin text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  return pm_share_pin_ok(p_token::uuid, p_pin);
end $$;

-- Old signatures (without p_pin) must go, or they would still answer without a PIN.
drop function if exists get_shared_project(uuid);
drop function if exists get_shared_tasks(uuid);
drop function if exists get_shared_milestones(uuid);
drop function if exists get_shared_comments(uuid);
drop function if exists add_shared_comment(uuid, text, text);
drop function if exists approve_milestone_client(uuid, uuid, text, text);
drop function if exists approve_task_client(uuid, text, text, text);

-- Without the PIN, a protected project shows only its name and that it is locked.
create or replace function get_shared_project(p_token uuid, p_pin text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare p pm_projects;
begin
  select * into p from pm_projects where share_token = p_token;
  if p.id is null then return null; end if;
  if pm_share_pin_ok(p_token, p_pin) then
    return (to_jsonb(p) - 'share_pin') || jsonb_build_object('has_share_pin', p.share_pin is not null);
  end if;
  return jsonb_build_object('id', p.id, 'name', p.name, 'has_share_pin', true, 'locked', true);
end $$;

create or replace function get_shared_tasks(p_token uuid, p_pin text default null)
returns setof pm_tasks language plpgsql security definer set search_path = public as $$
begin
  if not pm_share_pin_ok(p_token, p_pin) then return; end if;
  return query select t.* from pm_tasks t join pm_projects p on p.id = t.project_id
    where p.share_token = p_token order by t.position asc nulls last, t.created_at asc;
end $$;

create or replace function get_shared_milestones(p_token uuid, p_pin text default null)
returns setof pm_milestones language plpgsql security definer set search_path = public as $$
begin
  if not pm_share_pin_ok(p_token, p_pin) then return; end if;
  return query select m.* from pm_milestones m join pm_projects p on p.id = m.project_id
    where p.share_token = p_token order by m.due_date asc nulls last;
end $$;

create or replace function get_shared_comments(p_token uuid, p_pin text default null)
returns setof pm_client_comments language plpgsql security definer set search_path = public as $$
begin
  if not pm_share_pin_ok(p_token, p_pin) then return; end if;
  -- pm_client_comments.share_token is text, not uuid
  return query select c.* from pm_client_comments c where c.share_token = p_token::text order by c.created_at asc;
end $$;

create or replace function add_shared_comment(p_token uuid, p_author text, p_content text, p_pin text default null)
returns pm_client_comments language plpgsql security definer set search_path = public as $$
declare v_project uuid; v_row pm_client_comments;
begin
  select id into v_project from pm_projects where share_token = p_token;
  if v_project is null then raise exception 'invalid share token'; end if;
  if not pm_share_pin_ok(p_token, p_pin) then raise exception 'PIN required'; end if;
  insert into pm_client_comments (project_id, share_token, author_name, content)
  values (v_project, p_token::text, left(coalesce(p_author,''),120), left(coalesce(p_content,''),4000))
  returning * into v_row;
  return v_row;
end $$;

create or replace function approve_milestone_client(p_milestone_id uuid, p_token uuid, p_status text, p_note text default null, p_pin text default null)
returns pm_milestones language plpgsql security definer set search_path = public as $$
declare v_row pm_milestones;
begin
  if p_status not in ('approved','rejected','pending') then raise exception 'bad status'; end if;
  if not pm_share_pin_ok(p_token, p_pin) then raise exception 'PIN required'; end if;
  update pm_milestones m
     set approval_status = p_status, client_note = left(p_note, 2000)
    from pm_projects p
   where m.id = p_milestone_id and p.id = m.project_id and p.share_token = p_token
  returning m.* into v_row;
  if v_row.id is null then raise exception 'milestone not found for token'; end if;
  return v_row;
end $$;

create or replace function approve_task_client(p_task_id uuid, p_share_token text, p_status text, p_note text default null, p_pin text default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_result json;
begin
  if p_status not in ('approved','needs_revision','pending') then raise exception 'bad status'; end if;
  if not exists (
    select 1 from pm_tasks t join pm_projects p on p.id = t.project_id
    where t.id = p_task_id and p.share_token = p_share_token::uuid
  ) then raise exception 'Invalid share token'; end if;
  if not pm_share_pin_ok(p_share_token::uuid, p_pin) then raise exception 'PIN required'; end if;
  update pm_tasks set client_approval_status = p_status, client_approval_note = left(p_note, 2000) where id = p_task_id;
  select row_to_json(t) into v_result from pm_tasks t where t.id = p_task_id;
  return v_result;
end $$;

grant execute on function
  verify_share_pin(text, text),
  get_shared_project(uuid, text), get_shared_tasks(uuid, text), get_shared_milestones(uuid, text),
  get_shared_comments(uuid, text), add_shared_comment(uuid, text, text, text),
  approve_milestone_client(uuid, uuid, text, text, text), approve_task_client(uuid, text, text, text, text)
  to anon, authenticated;

-- ------------------------------------------------- 3. server-only helpers ---
revoke all on function ai_rate_hit(text, int, int) from public, anon, authenticated;
revoke all on function get_email_pref(text, text) from public, anon, authenticated;

notify pgrst, 'reload schema';
