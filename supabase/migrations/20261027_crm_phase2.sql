-- ============================================================================
-- Vikku CRM, phase 2: projects, payments, retainers and expenses.
--
-- crm_projects is the business side of a client project (budget, stage,
-- dates) and can link to a Vikku PM board via pm_project_id; PM tables are not
-- changed. Every crm_* table is admin-only (crm_is_admin() from phase 1).
-- Payments and new projects are logged to the client's timeline by triggers.
--
-- Requires 20261026_crm_phase1.sql. Safe to run more than once.
-- Run in the Supabase SQL editor.
-- ============================================================================

-- --------------------------------------------------------------- projects ---
create table if not exists crm_projects (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references crm_clients (id) on delete cascade,
  name           text not null check (length(trim(name)) > 0),
  service        text,
  budget         numeric(14, 2) not null default 0 check (budget >= 0),
  currency       text not null default 'INR' check (currency in ('INR', 'USD')),
  stage          text not null default 'new' check (stage in ('new', 'ongoing', 'completed', 'cancelled')),
  start_date     date,
  due_date       date,
  pm_project_id  uuid references pm_projects (id) on delete set null,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- --------------------------------------------------------------- payments ---
create table if not exists crm_payments (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references crm_clients (id) on delete cascade,
  project_id  uuid references crm_projects (id) on delete set null,
  amount      numeric(14, 2) not null check (amount > 0),
  currency    text not null default 'INR' check (currency in ('INR', 'USD')),
  kind        text not null default 'milestone' check (kind in ('advance', 'milestone', 'final', 'retainer', 'other')),
  method      text check (method in ('upi', 'bank', 'razorpay', 'card', 'cash', 'other')),
  status      text not null default 'received' check (status in ('received', 'pending')),
  paid_on     date,
  due_on      date,
  reference   text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (status <> 'received' or paid_on is not null)
);

-- -------------------------------------------------------------- retainers ---
create table if not exists crm_retainers (
  id                 uuid primary key default gen_random_uuid(),
  client_id          uuid not null references crm_clients (id) on delete cascade,
  title              text not null check (length(trim(title)) > 0),
  amount             numeric(14, 2) not null check (amount > 0),
  currency           text not null default 'INR' check (currency in ('INR', 'USD')),
  start_date         date not null default current_date,
  next_billing_date  date,
  status             text not null default 'active' check (status in ('active', 'paused', 'ended')),
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- --------------------------------------------------------------- expenses ---
create table if not exists crm_expenses (
  id           uuid primary key default gen_random_uuid(),
  spent_on     date not null default current_date,
  amount       numeric(14, 2) not null check (amount > 0),
  currency     text not null default 'INR' check (currency in ('INR', 'USD')),
  category     text not null default 'other' check (category in ('tools', 'freelancer', 'hosting', 'ads', 'travel', 'other')),
  description  text,
  client_id    uuid references crm_clients (id) on delete set null,
  project_id   uuid references crm_projects (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists crm_projects_client_idx   on crm_projects (client_id, created_at desc);
create index if not exists crm_projects_stage_idx    on crm_projects (stage, updated_at desc);
create index if not exists crm_payments_client_idx   on crm_payments (client_id, paid_on desc);
create index if not exists crm_payments_project_idx  on crm_payments (project_id);
create index if not exists crm_payments_pending_idx  on crm_payments (due_on) where status = 'pending';
create index if not exists crm_retainers_client_idx  on crm_retainers (client_id);
create index if not exists crm_expenses_spent_idx    on crm_expenses (spent_on desc);

-- ------------------------------------------------- timeline: new kinds -----
alter table crm_activity drop constraint if exists crm_activity_kind_check;
alter table crm_activity add constraint crm_activity_kind_check check (kind in (
  'note', 'call', 'email', 'whatsapp', 'meeting', 'created', 'stage_change', 'converted', 'project', 'payment'));

-- --------------------------------------------------------------- triggers ---
do $$
declare t text;
begin
  foreach t in array array['crm_projects', 'crm_payments', 'crm_retainers', 'crm_expenses'] loop
    execute format('drop trigger if exists %I on %I', t || '_updated_at', t);
    execute format('create trigger %I before update on %I for each row execute function crm_set_updated_at()', t || '_updated_at', t);
  end loop;
end $$;

create or replace function crm_money(amount numeric, currency text)
returns text language sql immutable as $$
  select case when currency = 'USD' then '$' else '₹' end || rtrim(to_char(amount, 'FM999,999,999,990.99'), '.')
$$;

create or replace function crm_log_project()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    insert into crm_activity (client_id, kind, body)
    values (new.client_id, 'project', 'Project added: ' || new.name || ' (' || crm_money(new.budget, new.currency) || ')');
  elsif new.stage is distinct from old.stage then
    insert into crm_activity (client_id, kind, body)
    values (new.client_id, 'project', new.name || ': ' || old.stage || ' → ' || new.stage);
  end if;
  return new;
end $$;

drop trigger if exists crm_projects_log on crm_projects;
create trigger crm_projects_log after insert or update of stage on crm_projects
  for each row execute function crm_log_project();

-- Logged when money arrives: on insert as received, or when a pending payment is marked received.
create or replace function crm_log_payment()
returns trigger language plpgsql as $$
begin
  if new.status = 'received' and (tg_op = 'INSERT' or old.status is distinct from 'received') then
    insert into crm_activity (client_id, kind, body)
    values (new.client_id, 'payment', 'Payment received: ' || crm_money(new.amount, new.currency));
  end if;
  return new;
end $$;

drop trigger if exists crm_payments_log on crm_payments;
create trigger crm_payments_log after insert or update of status on crm_payments
  for each row execute function crm_log_payment();

-- ------------------------------------------------------------ security -----
do $$
declare r record; t text;
begin
  foreach t in array array['crm_projects', 'crm_payments', 'crm_retainers', 'crm_expenses'] loop
    for r in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', r.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for all using (crm_is_admin()) with check (crm_is_admin())', t || '_admin_only', t);
  end loop;
end $$;

-- Make the new tables visible to the API straight away.
notify pgrst, 'reload schema';
