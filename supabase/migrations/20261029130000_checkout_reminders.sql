-- Abandoned checkout reminder (Luka said yes, 2026-10-29).
--   checkout_starts  one row per "Continue to payment" on our checkout (app/api/checkout): the email the parent typed,
--                    what they were buying and from which decoder moment. lib/checkout-reminders.ts sends ONE reminder
--                    2 to 48 hours later if that email hasn't paid since, then stamps reminded_at. Its token is the key
--                    for the reminder's unsubscribe link (lib/consent.ts), like signups.confirm_token.
-- Rows are kept 30 days (prune_old_data below). Additive: apply it, then deploy.

create table public.checkout_starts (
  id bigint generated always as identity primary key,
  email text not null,
  order_key text not null,
  crew text,
  moment text,
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reminded_at timestamptz,
  unsubscribed_at timestamptz
);
create index checkout_starts_email_idx on public.checkout_starts (email);
create index checkout_starts_created_at_idx on public.checkout_starts (created_at);

alter table public.checkout_starts enable row level security;
revoke all on public.checkout_starts from anon, authenticated;

create or replace function public.prune_old_data()
returns void
language sql set search_path = '' as $$
  delete from public.page_views where created_at < now() - interval '13 months';
  -- quiz_events go with their visit (on delete cascade); a lead keeps its email, its session_id becomes null.
  delete from public.quiz_sessions where started_at < now() - interval '13 months';
  delete from public.rate_limits where window_start < now() - interval '1 day';
  -- An unpaid checkout is only useful for its one reminder.
  delete from public.checkout_starts where created_at < now() - interval '30 days';
$$;

revoke execute on function public.prune_old_data() from public, anon, authenticated;
grant execute on function public.prune_old_data() to service_role;
