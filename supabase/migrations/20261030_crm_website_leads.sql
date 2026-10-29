-- ============================================================================
-- Vikku CRM: website sign-ups become CRM leads.
--
-- Everyone who leaves an email on the site lands in `subscribers` (footer
-- newsletter, or a free tool's "email me the result"). This trigger also adds
-- them to crm_leads, so they show up on the Leads board and the admin Today
-- page with a follow-up due today:
--   footer          -> source 'website',   "Subscribed in the website footer."
--   any tool source -> source 'free_tool', "Used the Cost Estimator." plus the
--                      link to their latest saved result, if they emailed one.
-- People already in the CRM (as a lead or client, matched by email) are skipped.
-- The CRM part can never block a sign-up: any error inside it is swallowed.
-- Existing subscribers are imported once at the bottom.
--
-- Requires CRM phase 1. Safe to run more than once. Run in the Supabase SQL editor.
-- ============================================================================

create or replace function crm_lead_from_subscriber(p_email text, p_source text, p_at timestamptz)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  em    text := lower(trim(p_email));
  src   text := coalesce(nullif(trim(p_source), ''), 'footer');
  tool  text := replace(initcap(replace(src, '_', ' ')), 'Ai ', 'AI ');
  share text;
  new_id uuid;
begin
  if em is null or position('@' in em) < 2 then return null; end if;
  if exists (select 1 from crm_clients where lower(email) = em)
     or exists (select 1 from crm_leads where lower(email) = em) then
    return null;
  end if;
  if src <> 'footer' then
    select share_id into share from tool_results where lower(email) = em order by created_at desc limit 1;
  end if;
  insert into crm_leads (name, email, source, stage, next_follow_up, notes, created_at)
  values (
    initcap(replace(replace(split_part(em, '@', 1), '.', ' '), '_', ' ')),
    em,
    case when src = 'footer' then 'website' else 'free_tool' end,
    'new',
    (now() at time zone 'Asia/Kolkata')::date,
    case when src = 'footer' then 'Subscribed in the website footer.'
         else 'Used the ' || tool || '.' || coalesce(' Result: https://www.vikku.in/r/' || share, '') end,
    coalesce(p_at, now())
  )
  returning id into new_id;
  return new_id;
end $$;

-- Only the trigger below and this migration call it.
revoke all on function crm_lead_from_subscriber(text, text, timestamptz) from public, anon, authenticated;

create or replace function crm_subscriber_to_lead()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  begin
    perform crm_lead_from_subscriber(new.email, new.source, new.created_at);
  exception when others then
    raise warning 'crm_subscriber_to_lead skipped %: %', new.email, sqlerrm;
  end;
  return new;
end $$;

drop trigger if exists crm_subscriber_to_lead on subscribers;
create trigger crm_subscriber_to_lead after insert on subscribers
  for each row execute function crm_subscriber_to_lead();

-- One-off import of everyone who signed up before this trigger existed (oldest first).
select crm_lead_from_subscriber(email, source, created_at)
from subscribers
order by created_at;

notify pgrst, 'reload schema';
