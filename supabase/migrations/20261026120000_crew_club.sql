-- Crew Club: members and their subscriptions. PROPOSAL, not applied yet.
--
-- Who writes what:
--   members        one row per parent, created automatically when an auth user is created
--                  (checkout signs the parent up by email). The parent may edit name and age groups.
--   subscriptions  written only by trusted server code (Stripe/PayPal webhooks, lib/supabase/admin.ts).
--                  The provider is the source of truth; this table mirrors it so pages can check access.
--   cancel_feedback  one row per cancel-flow answer (/account/cancel): reason, save offer, outcome.
--                  Lets us measure churn by reason and which save offer works (FUNNEL.md, section 4).
--
-- Plans and prices mirror lib/funnel.ts (club-monthly $9, club-yearly $79, club-lite $4, trial $1/14 days).

-- ---------- types ----------

create type public.age_group as enum ('whyzi', 'skuli', 'ruli', 'tweeni', 'sprouti', 'seki');
create type public.club_plan as enum ('club_monthly', 'club_yearly', 'club_lite');
create type public.payment_provider as enum ('stripe', 'paypal');
-- Same states as Stripe subscriptions, plus 'paused' (pause_collection / PayPal suspend).
create type public.subscription_status as enum (
  'incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'paused', 'unpaid', 'canceled'
);
create type public.cancel_reason as enum (
  'too_expensive', 'no_time', 'got_what_we_needed', 'wrong_age', 'something_broken', 'other'
);
create type public.save_offer as enum ('half_price_3_months', 'pause', 'switch_to_lite', 'change_age_free_month', 'fix_free_month');

-- ---------- shared ----------

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- members ----------

create table public.members (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text check (char_length(display_name) <= 80),
  -- A family can have kids in more than one age group (Whyzi 3–6 … Seki 14–17).
  age_groups public.age_group[] not null default '{}',
  stripe_customer_id text unique,
  paypal_payer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger members_updated_at before update on public.members
  for each row execute function public.set_updated_at();

-- New auth user → member row. Runs as the table owner so signup works without an insert policy.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.members (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep members.email in step when a parent changes their sign-in email.
create function public.handle_user_email_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.members set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- ---------- subscriptions ----------

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  plan public.club_plan not null,
  status public.subscription_status not null,
  provider public.payment_provider not null,
  provider_subscription_id text not null,
  -- What the parent is charged per period, in cents (900 = $9). Discounts live in the provider.
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'usd',
  billing_interval text not null check (billing_interval in ('month', 'year')),
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  -- "Pause for a while" (1, 2 or 3 months, no charge).
  paused_until timestamptz,
  -- Proof of the required "I understand it renews" tick at checkout (auto-renewal laws).
  renewal_consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);

-- One live Club subscription per parent; switching plans updates the row instead of adding one.
create unique index subscriptions_one_live_per_member on public.subscriptions (member_id)
  where status in ('trialing', 'active', 'past_due', 'paused');

create index subscriptions_member_id on public.subscriptions (member_id);

create trigger subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---------- cancel feedback ----------

create table public.cancel_feedback (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  subscription_id uuid references public.subscriptions (id) on delete set null,
  reason public.cancel_reason not null,
  comment text check (char_length(comment) <= 2000),
  offer_shown public.save_offer,
  offer_accepted boolean,
  created_at timestamptz not null default now()
);

create index cancel_feedback_member_id on public.cancel_feedback (member_id);

-- ---------- access check ----------

-- Does the signed-in parent have Club access right now? For gating Club pages and storage.
-- Lite counts as access; pages that are full-Club-only should also check the plan.
-- Only ever about the caller, so nobody can probe whether someone else is a member.
create function public.has_club_access() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.subscriptions s
    where s.member_id = (select auth.uid())
      and (s.status in ('trialing', 'active') or (s.status = 'past_due' and s.current_period_end > now()))
  );
$$;

-- ---------- row level security ----------

alter table public.members enable row level security;
alter table public.subscriptions enable row level security;
alter table public.cancel_feedback enable row level security;

-- Visitors who aren't signed in get nothing. Signed-in parents get only their own rows, and can
-- write only the columns below. Everything else goes through the secret key (bypasses RLS).
revoke all on public.members, public.subscriptions, public.cancel_feedback from anon, authenticated;
grant select on public.members, public.subscriptions, public.cancel_feedback to authenticated;
grant update (display_name, age_groups) on public.members to authenticated;
grant insert (member_id, subscription_id, reason, comment, offer_shown, offer_accepted) on public.cancel_feedback to authenticated;

create policy "members: read own" on public.members
  for select to authenticated using (id = (select auth.uid()));

create policy "members: update own" on public.members
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "subscriptions: read own" on public.subscriptions
  for select to authenticated using (member_id = (select auth.uid()));

create policy "cancel_feedback: read own" on public.cancel_feedback
  for select to authenticated using (member_id = (select auth.uid()));

create policy "cancel_feedback: add own" on public.cancel_feedback
  for insert to authenticated with check (
    member_id = (select auth.uid())
    and (subscription_id is null or exists (
      select 1 from public.subscriptions s where s.id = subscription_id and s.member_id = (select auth.uid())
    ))
  );

revoke execute on function public.has_club_access() from public, anon;
grant execute on function public.has_club_access() to authenticated;
