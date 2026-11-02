-- ============================================================================
-- Vikku CRM: regular costs and bank balance for /admin/finances.
--
-- crm_recurring_expenses holds costs that repeat monthly or yearly. Opening the
-- Finances page calls crm_post_recurring_expenses(), which adds whatever has
-- come due to crm_expenses, including any months since it last ran. The unique
-- index on (recurring_id, spent_on) stops a cost being added twice.
-- crm_cash_balances holds one balance per currency, as of a date. The page adds
-- money in and takes off money out dated after it. Admin-only like every crm_* table.
--
-- Requires phases 1 and 2. Safe to run more than once. Run in the Supabase SQL editor.
-- ============================================================================

-- ---------------------------------------------------- expense categories ---
alter table crm_expenses drop constraint if exists crm_expenses_category_check;
alter table crm_expenses add constraint crm_expenses_category_check
  check (category in ('tools', 'freelancer', 'salaries', 'office', 'hosting', 'ads', 'travel', 'other'));

-- ---------------------------------------------------------- regular costs ---
create table if not exists crm_recurring_expenses (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (length(trim(title)) > 0),
  amount       numeric(14, 2) not null check (amount > 0),
  currency     text not null default 'INR' check (currency in ('INR', 'USD')),
  category     text not null default 'tools' check (category in ('tools', 'freelancer', 'salaries', 'office', 'hosting', 'ads', 'travel', 'other')),
  every        text not null default 'month' check (every in ('month', 'year')),
  next_due     date not null check (next_due >= date '2000-01-01'),
  anchor_day   smallint not null check (anchor_day between 1 and 31), -- so a cost on the 31st returns to the 31st after a short month
  status       text not null default 'active' check (status in ('active', 'paused')),
  client_id    uuid references crm_clients (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table crm_expenses add column if not exists recurring_id uuid references crm_recurring_expenses (id) on delete set null;
create unique index if not exists crm_expenses_recurring_once on crm_expenses (recurring_id, spent_on) where recurring_id is not null;

-- ----------------------------------------------------------- bank balance ---
create table if not exists crm_cash_balances (
  currency    text primary key check (currency in ('INR', 'USD')),
  amount      numeric(14, 2) not null,
  as_of       date not null,
  updated_at  timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['crm_recurring_expenses', 'crm_cash_balances'] loop
    execute format('drop trigger if exists %I on %I', t || '_updated_at', t);
    execute format('create trigger %I before update on %I for each row execute function crm_set_updated_at()', t || '_updated_at', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_admin_only', t);
    execute format('create policy %I on public.%I for all using (crm_is_admin()) with check (crm_is_admin())', t || '_admin_only', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- ------------------------------------------------------------- posting ----
create or replace function crm_next_due(from_date date, anchor integer, every text)
returns date language sql immutable as $$
  with m as (
    select (date_trunc('month', from_date) + case when every = 'year' then interval '1 year' else interval '1 month' end)::date as first
  )
  select first + least(anchor, extract(day from first + interval '1 month - 1 day')::integer) - 1 from m
$$;

-- Adds every cost that has come due and returns how many were added.
create or replace function crm_post_recurring_expenses()
returns integer language plpgsql as $$
declare
  r      crm_recurring_expenses;
  today  date := (now() at time zone 'Asia/Kolkata')::date;
  due    date;
  added  integer;
  posted integer := 0;
begin
  if not crm_is_admin() then raise exception 'Not allowed'; end if;
  for r in select * from crm_recurring_expenses where status = 'active' and next_due <= today for update skip locked loop
    due := r.next_due;
    while due <= today loop
      insert into crm_expenses (spent_on, amount, currency, category, description, client_id, recurring_id)
      values (due, r.amount, r.currency, r.category, r.title, r.client_id, r.id)
      on conflict (recurring_id, spent_on) where recurring_id is not null do nothing;
      get diagnostics added = row_count;
      posted := posted + added;
      due := crm_next_due(due, r.anchor_day, r.every);
    end loop;
    update crm_recurring_expenses set next_due = due where id = r.id;
  end loop;
  return posted;
end $$;

revoke all on function crm_post_recurring_expenses() from public, anon;
grant execute on function crm_post_recurring_expenses() to authenticated, service_role;

notify pgrst, 'reload schema';
