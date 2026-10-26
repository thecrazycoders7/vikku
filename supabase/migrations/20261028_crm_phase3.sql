-- ============================================================================
-- Vikku CRM, phase 3: meetings (manual + Cal.com) and quotations.
--
-- crm_meetings holds meetings added by hand and bookings pushed by the
-- Cal.com webhook (/api/cal-webhook, matched on cal_uid). crm_documents holds
-- quotations with line items; numbers are generated as VQ-<year>-0001.
-- Admin-only like every crm_* table; the webhook and the daily digest use the
-- service role, which bypasses RLS.
--
-- Requires phases 1 and 2. Safe to run more than once. Run in the Supabase SQL editor.
-- ============================================================================

-- --------------------------------------------------------------- meetings ---
create table if not exists crm_meetings (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid references crm_leads (id) on delete set null,
  client_id       uuid references crm_clients (id) on delete set null,
  title           text not null check (length(trim(title)) > 0),
  starts_at       timestamptz not null,
  ends_at         timestamptz,
  location        text,
  status          text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'no_show')),
  source          text not null default 'manual' check (source in ('manual', 'cal')),
  cal_uid         text unique,
  attendee_name   text,
  attendee_email  text,
  notes           text,
  outcome         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

-- -------------------------------------------------------------- documents ---
create sequence if not exists crm_quote_seq;

create table if not exists crm_documents (
  id           uuid primary key default gen_random_uuid(),
  number       text not null unique default ('VQ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('crm_quote_seq')::text, 4, '0')),
  kind         text not null default 'quotation' check (kind in ('quotation')),
  lead_id      uuid references crm_leads (id) on delete set null,
  client_id    uuid references crm_clients (id) on delete cascade,
  title        text not null check (length(trim(title)) > 0),
  currency     text not null default 'INR' check (currency in ('INR', 'USD')),
  items        jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  tax_percent  numeric(5, 2) not null default 18 check (tax_percent between 0 and 100),
  discount     numeric(14, 2) not null default 0 check (discount >= 0),
  total        numeric(14, 2) not null default 0 check (total >= 0),
  valid_until  date,
  status       text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined')),
  notes        text,
  terms        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (lead_id is not null or client_id is not null)
);

create index if not exists crm_meetings_starts_idx  on crm_meetings (starts_at);
create index if not exists crm_meetings_lead_idx    on crm_meetings (lead_id);
create index if not exists crm_meetings_client_idx  on crm_meetings (client_id);
create index if not exists crm_documents_client_idx on crm_documents (client_id, created_at desc);
create index if not exists crm_documents_lead_idx   on crm_documents (lead_id);

-- ------------------------------------------------- timeline: new kinds -----
alter table crm_activity drop constraint if exists crm_activity_kind_check;
alter table crm_activity add constraint crm_activity_kind_check check (kind in (
  'note', 'call', 'email', 'whatsapp', 'meeting', 'created', 'stage_change', 'converted', 'project', 'payment', 'document'));

-- --------------------------------------------------------------- triggers ---
do $$
declare t text;
begin
  foreach t in array array['crm_meetings', 'crm_documents'] loop
    execute format('drop trigger if exists %I on %I', t || '_updated_at', t);
    execute format('create trigger %I before update on %I for each row execute function crm_set_updated_at()', t || '_updated_at', t);
  end loop;
end $$;

create or replace function crm_log_meeting()
returns trigger language plpgsql as $$
declare
  when_text text := to_char(new.starts_at at time zone 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM') || ' IST';
begin
  if tg_op = 'INSERT' then
    insert into crm_activity (lead_id, client_id, kind, body)
    values (new.lead_id, new.client_id, 'meeting',
            case when new.source = 'cal' then 'Booked via Cal.com: ' else 'Meeting scheduled: ' end || new.title || ' · ' || when_text);
  elsif new.status is distinct from old.status then
    insert into crm_activity (lead_id, client_id, kind, body)
    values (new.lead_id, new.client_id, 'meeting', new.title || ': ' || replace(new.status, '_', ' ') || coalesce(' · ' || new.outcome, ''));
  end if;
  return new;
end $$;

drop trigger if exists crm_meetings_log on crm_meetings;
create trigger crm_meetings_log after insert or update of status on crm_meetings
  for each row when (new.lead_id is not null or new.client_id is not null)
  execute function crm_log_meeting();

create or replace function crm_log_document()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    insert into crm_activity (lead_id, client_id, kind, body)
    values (new.lead_id, new.client_id, 'document', 'Quotation ' || new.number || ' created: ' || crm_money(new.total, new.currency));
  elsif new.status is distinct from old.status then
    insert into crm_activity (lead_id, client_id, kind, body)
    values (new.lead_id, new.client_id, 'document', 'Quotation ' || new.number || ' marked ' || new.status);
  end if;
  return new;
end $$;

drop trigger if exists crm_documents_log on crm_documents;
create trigger crm_documents_log after insert or update of status on crm_documents
  for each row execute function crm_log_document();

-- ------------------------------------------------------------ security -----
do $$
declare r record; t text;
begin
  foreach t in array array['crm_meetings', 'crm_documents'] loop
    for r in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', r.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for all using (crm_is_admin()) with check (crm_is_admin())', t || '_admin_only', t);
  end loop;
end $$;

grant usage, select on sequence crm_quote_seq to authenticated, service_role;

notify pgrst, 'reload schema';
