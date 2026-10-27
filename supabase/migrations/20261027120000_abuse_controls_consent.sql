-- Abuse controls, confirmed email consent, webhook event order and data retention (pre-launch audit, 2026-10-27).
--
--   rate_limits       one row per (bucket, hashed client IP): how many requests in the current window (lib/rate-limit.ts).
--                     The key holds an HMAC of the IP, never the IP itself, and rows older than a day are pruned.
--   signups           newsletter forms need a click on the emailed link before the address counts (double opt-in):
--                     confirm_token is that link's key (and the unsubscribe key), confirmed_at the click.
--   quiz_leads        tips_consent now means "confirmed": ticking the box only sets tips_requested_at, and the result
--                     email carries the confirm link. result_emailed_at caps the result email at one per address a day.
--   subscriptions     provider_event_at = time of the newest Creem event applied, so a late, older event is ignored.
--   prune_old_data()  deletes page views and quiz visits older than 13 months, and old rate-limit rows. Scheduled daily
--                     with pg_cron when that extension is on (Database → Extensions); otherwise see README "Retention".
--
-- Additive only: the code from before this migration keeps working, so apply it first, then deploy.

-- ---------- rate limits ----------

create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hits integer not null default 0
);
create index rate_limits_window_start_idx on public.rate_limits (window_start);

alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- Counts one request for key and says whether it is still within max per window (fixed window, atomic).
create function public.rate_limit_hit(p_key text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql set search_path = '' as $$
declare
  n integer;
begin
  insert into public.rate_limits as r (key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update set
    window_start = case when r.window_start <= now() - make_interval(secs => p_window_seconds) then now() else r.window_start end,
    hits = case when r.window_start <= now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end
  returning hits into n;
  return n <= p_max;
end
$$;

revoke execute on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;

-- ---------- confirmed consent ----------

alter table public.signups
  add column confirm_token uuid not null default gen_random_uuid(),
  add column confirm_sent_at timestamptz,
  add column confirmed_at timestamptz;
create unique index signups_confirm_token_idx on public.signups (confirm_token);

-- Rows from before double opt-in keep counting as they did (they signed up under the old form). Every row gets a
-- confirmed_at; only newsletter forms are ever asked to confirm from now on.
update public.signups set confirmed_at = created_at where confirmed_at is null;

alter table public.quiz_leads
  add column token uuid not null default gen_random_uuid(),
  add column tips_requested_at timestamptz,
  add column result_emailed_at timestamptz;
create unique index quiz_leads_token_idx on public.quiz_leads (token);

-- Per site form, plus the /code quiz: all signups ever, those still subscribed (and confirmed), and those new in the period.
create or replace function public.signups_summary(since timestamptz)
returns table (form text, total bigint, subscribed bigint, in_period bigint)
language sql stable set search_path = '' as $$
  select s.form, count(*), count(*) filter (where s.confirmed_at is not null and s.unsubscribed_at is null), count(*) filter (where s.created_at >= since)
  from public.signups s
  group by 1
  union all
  select 'quiz', count(*), count(*) filter (where q.tips_consent and q.unsubscribed_at is null), count(*) filter (where q.created_at >= since)
  from public.quiz_leads q
$$;

-- Unique newsletter emails: confirmed on one of the newsletter forms (lib/analytics.ts) or confirmed the quiz's weekly tips.
create or replace function public.newsletter_subscribers(forms text[])
returns bigint
language sql stable set search_path = '' as $$
  select count(*) from (
    select s.email from public.signups s where s.form = any (forms) and s.confirmed_at is not null and s.unsubscribed_at is null
    union
    select q.email from public.quiz_leads q where q.tips_consent and q.unsubscribed_at is null
  ) emails
$$;

-- create or replace keeps the earlier grants (service_role only).

-- ---------- webhook event order ----------

alter table public.subscriptions add column provider_event_at timestamptz;

-- ---------- retention ----------

create function public.prune_old_data()
returns void
language sql set search_path = '' as $$
  delete from public.page_views where created_at < now() - interval '13 months';
  -- quiz_events go with their visit (on delete cascade); a lead keeps its email, its session_id becomes null.
  delete from public.quiz_sessions where started_at < now() - interval '13 months';
  delete from public.rate_limits where window_start < now() - interval '1 day';
$$;

revoke execute on function public.prune_old_data() from public, anon, authenticated;
grant execute on function public.prune_old_data() to service_role;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('prune-old-data', '17 3 * * *', 'select public.prune_old_data()');
  else
    raise notice 'pg_cron is not enabled: prune_old_data() is not scheduled (README: Retention).';
  end if;
end
$$;
