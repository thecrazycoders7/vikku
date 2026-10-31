-- ============================================================================
-- Vikku CRM: documents made from templates (/admin/documents).
--
-- crm_client_docs keeps each filled-in document with its own copy of the wording,
-- so a signed contract never changes when a template is edited later.
-- crm_doc_settings holds the business details filled into every document
-- (key 'company': legal form, PAN, bank details) and edited template wording
-- (key 'template:<id>'). Bank and tax details live here, not in the code.
-- Admin-only like every crm_* table.
--
-- Requires phase 1. Safe to run more than once. Run in the Supabase SQL editor.
-- ============================================================================

create table if not exists crm_client_docs (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references crm_clients (id) on delete set null,
  template_id  text not null,
  title        text not null check (length(trim(title)) > 0),
  body         text not null,
  fields       jsonb not null default '{}'::jsonb check (jsonb_typeof(fields) = 'object'),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists crm_client_docs_client_idx on crm_client_docs (client_id);

create table if not exists crm_doc_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['crm_client_docs', 'crm_doc_settings'] loop
    execute format('drop trigger if exists %I on %I', t || '_updated_at', t);
    execute format('create trigger %I before update on %I for each row execute function crm_set_updated_at()', t || '_updated_at', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_admin_only', t);
    execute format('create policy %I on public.%I for all using (crm_is_admin()) with check (crm_is_admin())', t || '_admin_only', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

notify pgrst, 'reload schema';
