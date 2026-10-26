-- The /code quiz (lead magnet sent in Instagram DMs): visits, every click, and the emails it collects.
--
-- Who writes what: only trusted server code (app/api/quiz/*, the Creem webhook) with the secret key.
-- Browsers never touch these tables, and /stats/quiz reads them through the functions at the bottom.
--   quiz_sessions  one row per quiz visit (a random id the browser keeps for the tab), where it came from,
--                  the answers that shape the result, and how far it got: email, result, checkout, purchase.
--   quiz_events    one row per screen view, answer, back click, exit and result-page click, with time on screen.
--   quiz_leads     one row per email address. tips_consent = ticked "send me one short crew tip a week".
-- No child data: an age range and the moments picked, never a name.

create table public.quiz_sessions (
  id uuid primary key,
  variant text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  keyword text,
  referrer text,
  device text,
  age text,
  moments text[] not null default '{}',
  duo text,
  last_step text not null default 'intro',
  started_at timestamptz not null default now(),
  emailed_at timestamptz,
  result_at timestamptz,
  checkout_at timestamptz,
  checkout_product text,
  purchased_at timestamptz,
  purchase_order text,
  updated_at timestamptz not null default now()
);
create index quiz_sessions_started_at_idx on public.quiz_sessions (started_at);

create trigger quiz_sessions_updated_at before update on public.quiz_sessions
  for each row execute function public.set_updated_at();

create table public.quiz_events (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.quiz_sessions (id) on delete cascade,
  step text not null,
  event text not null check (event in ('view', 'answer', 'back', 'leave', 'click')),
  value jsonb,
  ms integer check (ms >= 0),
  created_at timestamptz not null default now()
);
create index quiz_events_session_id_idx on public.quiz_events (session_id);
create index quiz_events_created_at_idx on public.quiz_events (created_at);

create table public.quiz_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  session_id uuid references public.quiz_sessions (id) on delete set null,
  tips_consent boolean not null default false,
  consent_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- row level security: no access for browsers ----------

alter table public.quiz_sessions enable row level security;
alter table public.quiz_events enable row level security;
alter table public.quiz_leads enable row level security;
revoke all on public.quiz_sessions, public.quiz_events, public.quiz_leads from anon, authenticated;

-- ---------- numbers for /stats/quiz ----------

-- How many visits saw each screen, and the median milliseconds spent answering it, by variant.
-- src = one utm_source ('direct' = none), or null for all sources.
create function public.quiz_funnel(since timestamptz, src text default null)
returns table (variant text, step text, sessions bigint, median_ms double precision)
language sql stable set search_path = '' as $$
  select s.variant,
         e.step,
         count(distinct e.session_id) filter (where e.event = 'view') as sessions,
         percentile_cont(0.5) within group (order by e.ms) filter (where e.event = 'answer') as median_ms
  from public.quiz_events e
  join public.quiz_sessions s on s.id = e.session_id
  where s.started_at >= since
    and (src is null or coalesce(nullif(s.utm_source, ''), 'direct') = src)
  group by 1, 2
$$;

-- What parents answered: age, moments picked, the Duo question, myth answers and the tips checkbox.
create function public.quiz_answers(since timestamptz)
returns table (question text, answer text, sessions bigint)
language sql stable set search_path = '' as $$
  select 'age', s.age, count(*) from public.quiz_sessions s
    where s.started_at >= since and s.age is not null group by 2
  union all
  select 'moment', m, count(*) from public.quiz_sessions s cross join unnest(s.moments) as m
    where s.started_at >= since group by 2
  union all
  select 'duo', s.duo, count(*) from public.quiz_sessions s
    where s.started_at >= since and s.duo is not null group by 2
  union all
  select e.step, (e.value ->> 'said') || case when (e.value ->> 'right')::boolean then ' (right)' else ' (wrong)' end, count(distinct e.session_id)
    from public.quiz_events e join public.quiz_sessions s on s.id = e.session_id
    where s.started_at >= since and e.event = 'answer' and e.step in ('myth-1', 'myth-2') group by 1, 2
  union all
  select 'tips', case when (e.value ->> 'consent')::boolean then 'yes' else 'no' end, count(distinct e.session_id)
    from public.quiz_events e join public.quiz_sessions s on s.id = e.session_id
    where s.started_at >= since and e.event = 'answer' and e.step = 'gate' group by 2
$$;

-- Totals per variant and source: visits, emails, results, checkout clicks, purchases.
create function public.quiz_totals(since timestamptz)
returns table (variant text, source text, started bigint, emailed bigint, results bigint, checkouts bigint, purchases bigint)
language sql stable set search_path = '' as $$
  select s.variant,
         coalesce(nullif(s.utm_source, ''), 'direct'),
         count(*),
         count(s.emailed_at),
         count(s.result_at),
         count(s.checkout_at),
         count(s.purchased_at)
  from public.quiz_sessions s
  where s.started_at >= since
  group by 1, 2
$$;

revoke execute on function public.quiz_funnel(timestamptz, text), public.quiz_answers(timestamptz), public.quiz_totals(timestamptz) from public, anon, authenticated;
grant execute on function public.quiz_funnel(timestamptz, text), public.quiz_answers(timestamptz), public.quiz_totals(timestamptz) to service_role;
