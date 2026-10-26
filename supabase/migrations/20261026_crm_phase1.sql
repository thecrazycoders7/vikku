-- ============================================================================
-- Vikku CRM, phase 1: leads, clients and their activity timeline.
--
-- Private to Vikku admins: every crm_* table is readable and writable only by
-- the admin emails below (same list as AdminGate.jsx and the admin-stats
-- function). Stage changes and new leads are logged to crm_activity by
-- triggers; crm_convert_lead() turns a lead into a client in one transaction.
--
-- Safe to run more than once (idempotent). Run in the Supabase SQL editor.
-- ============================================================================

create or replace function crm_is_admin()
returns boolean
language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'sanikommuharshavardhanreddy6@gmail.com',
    'info@vikku.in'
  );
$$;

create or replace function crm_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- clients ---
create table if not exists crm_clients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) > 0),
  company     text,
  email       text,
  phone       text,
  city        text,
  country     text,
  currency    text not null default 'INR' check (currency in ('INR', 'USD')),
  gst_number  text,
  address     text,
  status      text not null default 'active' check (status in ('active', 'past')),
  notes       text,
  lead_id     uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------------ leads ---
create table if not exists crm_leads (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (length(trim(name)) > 0),
  company         text,
  email           text,
  phone           text,
  city            text,
  country         text,
  source          text not null default 'other' check (source in (
                    'website', 'cal_booking', 'whatsapp', 'instagram', 'linkedin',
                    'referral', 'cold_call', 'free_tool', 'other')),
  service         text,
  value           numeric(14, 2) not null default 0 check (value >= 0),
  currency        text not null default 'INR' check (currency in ('INR', 'USD')),
  stage           text not null default 'new' check (stage in (
                    'new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
  lost_reason     text,
  next_follow_up  date,
  notes           text,
  client_id       uuid references crm_clients (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'crm_clients_lead_id_fkey') then
    alter table crm_clients add constraint crm_clients_lead_id_fkey
      foreign key (lead_id) references crm_leads (id) on delete set null;
  end if;
end $$;

-- --------------------------------------------------------------- activity ---
create table if not exists crm_activity (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references crm_leads (id) on delete cascade,
  client_id   uuid references crm_clients (id) on delete cascade,
  kind        text not null check (kind in (
                'note', 'call', 'email', 'whatsapp', 'meeting', 'created', 'stage_change', 'converted')),
  body        text,
  created_by  uuid default auth.uid(),
  created_at  timestamptz not null default now(),
  check (lead_id is not null or client_id is not null)
);

create index if not exists crm_leads_stage_idx       on crm_leads (stage, updated_at desc);
create index if not exists crm_leads_follow_up_idx   on crm_leads (next_follow_up) where stage not in ('won', 'lost');
create index if not exists crm_clients_status_idx    on crm_clients (status, name);
create index if not exists crm_activity_lead_idx     on crm_activity (lead_id, created_at desc);
create index if not exists crm_activity_client_idx   on crm_activity (client_id, created_at desc);

-- ---------------------------------------------------------------- triggers --
drop trigger if exists crm_clients_updated_at on crm_clients;
create trigger crm_clients_updated_at before update on crm_clients
  for each row execute function crm_set_updated_at();

drop trigger if exists crm_leads_updated_at on crm_leads;
create trigger crm_leads_updated_at before update on crm_leads
  for each row execute function crm_set_updated_at();

-- New leads and stage moves land in the timeline automatically.
create or replace function crm_log_lead_change()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    insert into crm_activity (lead_id, kind, body) values (new.id, 'created', 'Lead added');
  elsif new.stage is distinct from old.stage then
    insert into crm_activity (lead_id, client_id, kind, body)
    values (new.id, new.client_id, 'stage_change', old.stage || ' → ' || new.stage);
  end if;
  return new;
end $$;

drop trigger if exists crm_leads_log on crm_leads;
create trigger crm_leads_log after insert or update of stage on crm_leads
  for each row execute function crm_log_lead_change();

-- ------------------------------------------------------- lead → client ------
-- Creates the client from the lead's details, marks the lead won and links the
-- two. Converting an already-converted lead returns its existing client.
create or replace function crm_convert_lead(p_lead_id uuid)
returns uuid
language plpgsql as $$
declare
  l crm_leads;
  new_client uuid;
begin
  if not crm_is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select * into l from crm_leads where id = p_lead_id for update;
  if not found then
    raise exception 'lead not found' using errcode = 'P0002';
  end if;
  if l.client_id is not null then
    return l.client_id;
  end if;

  insert into crm_clients (name, company, email, phone, city, country, currency, notes, lead_id)
  values (l.name, l.company, l.email, l.phone, l.city, l.country, l.currency, l.notes, l.id)
  returning id into new_client;

  update crm_leads set client_id = new_client, stage = 'won', lost_reason = null where id = l.id;

  insert into crm_activity (lead_id, client_id, kind, body)
  values (l.id, new_client, 'converted', 'Converted to client');

  return new_client;
end $$;

-- ------------------------------------------------------------ security -----
do $$
declare r record; t text;
begin
  foreach t in array array['crm_clients', 'crm_leads', 'crm_activity'] loop
    for r in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', r.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for all using (crm_is_admin()) with check (crm_is_admin())', t || '_admin_only', t);
  end loop;
end $$;

revoke all on function crm_convert_lead(uuid) from public, anon;
grant execute on function crm_convert_lead(uuid) to authenticated;
