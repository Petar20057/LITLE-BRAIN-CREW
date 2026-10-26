-- Crew Club on Creem: brings the live database in line with 20261026120000_crew_club.sql as it reads today.
--
-- Why this exists: the first version of 20261026120000_crew_club.sql (commit e0e4c7f: Stripe/PayPal, Club Lite,
-- a $1 trial) was applied to the live database. The file was then rewritten for Creem under the same number
-- (commit f570c31), so `supabase db push` treats it as applied and the live schema never changed. This migration
-- makes that change. A fresh database that runs the current 20261026120000 file gets the same schema, and running
-- this one after it changes nothing (every step checks the current state first).
--
-- What changes:
--   club_plan            drop 'club_lite' (Club is the only membership)
--   payment_provider     'stripe', 'paypal' → 'creem'
--   subscription_status  Stripe's states → Creem's ('incomplete', 'incomplete_expired' out; 'scheduled_cancel', 'expired' in)
--   save_offer           'switch_to_lite' → 'pause_instead_of_done'
--   members              stripe_customer_id, paypal_payer_id → creem_customer_id
--   subscriptions_one_live_per_member and has_club_access(): Creem's live states
--
-- The tables were empty when this was written (2026-10-26). The guard below stops the migration if Stripe/PayPal data
-- shows up before it runs, instead of throwing it away.

do $$
begin
  -- Only on the old schema; the inner checks name Stripe/PayPal columns that a fresh database never had.
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'members' and column_name = 'stripe_customer_id') then
    if exists (select 1 from public.subscriptions)
       or exists (select 1 from public.cancel_feedback where offer_shown::text = 'switch_to_lite')
       or exists (select 1 from public.members where stripe_customer_id is not null or paypal_payer_id is not null) then
      raise exception 'Crew Club tables hold Stripe/PayPal data: map it to Creem by hand before running this migration';
    end if;
  end if;
end;
$$;

-- Swaps an enum for a new list of values, converting every column that uses it. Only for empty or compatible data.
create function pg_temp.replace_enum(type_name text, labels text[]) returns void
language plpgsql as $$
declare
  current_labels text[];
  col record;
begin
  select array_agg(e.enumlabel order by e.enumsortorder) into current_labels
  from pg_enum e join pg_type t on t.oid = e.enumtypid
  where t.typname = type_name and t.typnamespace = 'public'::regnamespace;
  if current_labels = labels then
    return;
  end if;

  execute format('alter type public.%I rename to %I', type_name, type_name || '_old');
  execute format('create type public.%I as enum (%s)', type_name,
                 (select string_agg(quote_literal(l), ', ') from unnest(labels) as l));
  for col in
    select c.table_name, c.column_name, c.data_type
    from information_schema.columns c
    where c.table_schema = 'public' and c.udt_schema = 'public' and c.udt_name in (type_name || '_old', '_' || type_name || '_old')
  loop
    execute format('alter table public.%I alter column %I type public.%I%s using %I::text%s::public.%I%s',
                   col.table_name, col.column_name, type_name, case when col.data_type = 'ARRAY' then '[]' else '' end,
                   col.column_name, case when col.data_type = 'ARRAY' then '[]' else '' end,
                   type_name, case when col.data_type = 'ARRAY' then '[]' else '' end);
  end loop;
  execute format('drop type public.%I', type_name || '_old');
end;
$$;

-- The partial index reads subscriptions.status, so it has to go before the status type can change.
drop index if exists public.subscriptions_one_live_per_member;

select pg_temp.replace_enum('club_plan', array['club_monthly', 'club_yearly']);
select pg_temp.replace_enum('payment_provider', array['creem']);
select pg_temp.replace_enum('subscription_status', array['trialing', 'active', 'past_due', 'unpaid', 'paused', 'scheduled_cancel', 'expired', 'canceled']);
select pg_temp.replace_enum('save_offer', array['half_price_3_months', 'pause', 'pause_instead_of_done', 'change_age_free_month', 'fix_free_month']);

-- One live Club subscription per parent; switching plans updates the row instead of adding one.
create unique index subscriptions_one_live_per_member on public.subscriptions (member_id)
  where status in ('trialing', 'active', 'past_due', 'unpaid', 'paused', 'scheduled_cancel');

-- ---------- members: Creem customer instead of Stripe/PayPal ----------

alter table public.members drop column if exists stripe_customer_id;
alter table public.members drop column if exists paypal_payer_id;
alter table public.members add column if not exists creem_customer_id text unique;

-- ---------- access check: a cancelled membership keeps access until the period ends ----------

create or replace function public.has_club_access() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.subscriptions s
    where s.member_id = (select auth.uid())
      and (s.status in ('trialing', 'active', 'scheduled_cancel') or (s.status = 'past_due' and s.current_period_end > now()))
  );
$$;

revoke execute on function public.has_club_access() from public, anon;
grant execute on function public.has_club_access() to authenticated;
