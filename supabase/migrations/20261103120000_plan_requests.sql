-- The Personal plan ($199, lib/funnel.ts ITEMS.personalPlan): the intake form a parent fills in on /personal-plan before paying.
-- One row per submitted form (app/api/personal-plan). status: new (saved) → checkout (Creem checkout created) → paid (webhook,
-- with its orders row) → replied / closed (set by the team in /admin/personal-plans). `answers` holds the whitelisted form
-- fields (lib/personal-plan-form.ts PLAN_FIELDS); we never ask for the child's name or health details. Browsers never touch
-- this table: the API route and the admin panel use the secret key.
create table public.plan_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email)),
  name text not null,
  kid_age smallint not null check (kid_age between 3 and 17),
  moment text not null,
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'checkout', 'paid', 'replied', 'closed')),
  order_id uuid references public.orders(id),
  -- Creem's hosted checkout for this form, so the team can re-send it to a parent who dropped off.
  checkout_url text,
  visitor_id uuid,
  session_id uuid,
  utm_source text,
  created_at timestamptz not null default now(),
  checkout_at timestamptz,
  paid_at timestamptz,
  replied_at timestamptz,
  closed_at timestamptz
);
create index plan_requests_created_at_idx on public.plan_requests (created_at);
create index plan_requests_email_idx on public.plan_requests (email);
create unique index plan_requests_one_order on public.plan_requests (order_id) where order_id is not null;

alter table public.plan_requests enable row level security;
revoke all on public.plan_requests from anon, authenticated;

-- A form that was never paid for is deleted after 30 days (the Privacy page says so). Same job as before, one more line.
create or replace function public.prune_old_data()
returns void
language sql set search_path = '' as $$
  delete from public.page_views where created_at < now() - interval '13 months';
  -- quiz_events go with their visit (on delete cascade); a lead keeps its email, its session_id becomes null.
  delete from public.quiz_sessions where started_at < now() - interval '13 months';
  delete from public.rate_limits where window_start < now() - interval '1 day';
  -- An unpaid checkout is only useful for its one reminder.
  delete from public.checkout_starts where created_at < now() - interval '30 days';
  delete from public.plan_requests where status in ('new', 'checkout') and created_at < now() - interval '30 days';
$$;

revoke execute on function public.prune_old_data() from public, anon, authenticated;
grant execute on function public.prune_old_data() to service_role;
