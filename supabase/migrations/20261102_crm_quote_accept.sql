-- ============================================================================
-- Vikku CRM: clients accept or decline a quotation online.
--
-- Each quotation gets a private link (vikku.in/q/<share_token>). The page and
-- its Accept / Decline buttons go through /api/quote, which reads with the
-- service role and calls crm_respond_to_quote(). Accepting, in one transaction:
--   - marks the quote accepted with the name the client typed and any note
--   - turns the lead into a client if it isn't one yet, and marks the lead won
--   - creates the CRM project (title, total, currency) and links it to the quote
--   - logs it on the timeline (status changes are logged by crm_log_document)
-- Declining marks it declined with the optional reason. Only quotes that were
-- sent and are still in date can be answered; answering twice changes nothing.
--
-- Requires CRM phases 1-3. Safe to run more than once. Run in the Supabase SQL editor.
-- ============================================================================

alter table crm_documents add column if not exists share_token uuid not null default gen_random_uuid();
alter table crm_documents add column if not exists responded_at timestamptz;
alter table crm_documents add column if not exists response_name text;
alter table crm_documents add column if not exists response_note text;
alter table crm_documents add column if not exists crm_project_id uuid references crm_projects (id) on delete set null;
create unique index if not exists crm_documents_share_token_idx on crm_documents (share_token);

create or replace function crm_respond_to_quote(p_token uuid, p_accept boolean, p_name text, p_note text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  d crm_documents;
  l crm_leads;
  v_client uuid;
  v_project uuid;
  v_name text := nullif(left(trim(coalesce(p_name, '')), 120), '');
  v_note text := nullif(left(trim(coalesce(p_note, '')), 2000), '');
begin
  select * into d from crm_documents where share_token = p_token for update;
  if not found then
    raise exception 'quote not found' using errcode = 'P0002';
  end if;
  if d.status in ('accepted', 'declined') then
    return jsonb_build_object('status', d.status, 'already', true);
  end if;
  if d.status <> 'sent' then
    raise exception 'quote not open' using errcode = 'P0001';
  end if;
  if d.valid_until is not null and d.valid_until < (now() at time zone 'Asia/Kolkata')::date then
    raise exception 'quote expired' using errcode = 'P0001';
  end if;

  if not p_accept then
    update crm_documents set status = 'declined', responded_at = now(), response_name = v_name, response_note = v_note
    where id = d.id;
    if v_note is not null then
      insert into crm_activity (lead_id, client_id, kind, body)
      values (d.lead_id, d.client_id, 'note', 'Reason for declining ' || d.number || ': ' || v_note);
    end if;
    return jsonb_build_object('status', 'declined');
  end if;

  if v_name is null then
    raise exception 'name required' using errcode = 'P0001';
  end if;

  -- The client: the quote's own, else the lead's, else a new one made from the lead (as crm_convert_lead does).
  v_client := d.client_id;
  if d.lead_id is not null then
    select * into l from crm_leads where id = d.lead_id for update;
    if found then
      if v_client is null and l.client_id is not null then
        v_client := l.client_id;
      elsif v_client is null then
        insert into crm_clients (name, company, email, phone, city, country, currency, notes, lead_id)
        values (l.name, l.company, l.email, l.phone, l.city, l.country, d.currency, l.notes, l.id)
        returning id into v_client;
        insert into crm_activity (lead_id, client_id, kind, body)
        values (l.id, v_client, 'converted', 'Converted to client (accepted ' || d.number || ')');
      end if;
      update crm_leads set client_id = coalesce(client_id, v_client), stage = 'won', lost_reason = null where id = l.id;
    end if;
  end if;

  insert into crm_projects (client_id, name, budget, currency, stage, notes)
  values (v_client, d.title, d.total, d.currency, 'new', 'From quotation ' || d.number)
  returning id into v_project;

  update crm_documents
  set status = 'accepted', client_id = v_client, crm_project_id = v_project,
      responded_at = now(), response_name = v_name, response_note = v_note
  where id = d.id;

  insert into crm_activity (lead_id, client_id, kind, body)
  values (d.lead_id, v_client, 'note', 'Quotation ' || d.number || ' accepted online by ' || v_name || coalesce(': ' || v_note, ''));

  return jsonb_build_object('status', 'accepted', 'client_id', v_client, 'project_id', v_project);
end $$;

-- Only the server (service role, /api/quote) calls it.
revoke all on function crm_respond_to_quote(uuid, boolean, text, text) from public, anon, authenticated;
grant execute on function crm_respond_to_quote(uuid, boolean, text, text) to service_role;

notify pgrst, 'reload schema';
