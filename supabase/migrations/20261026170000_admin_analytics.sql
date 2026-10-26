-- Numbers for the admin panel (/admin): visits to every page and the emails the site's forms collect.
--
-- Who writes what: only trusted server code (app/api/track, app/api/signup) with the secret key.
-- Browsers never touch these tables, and /admin reads them through the functions at the bottom.
--   page_views  one row per page shown: a random visitor id (localStorage, no cookie), a random visit id
--               (sessionStorage), the path, the site that sent the visitor, UTM tags, device type and country.
--               No IP address and no user agent are stored.
--   signups     one row per email per site form (free tips, stickers, waitlists, founding parents, schools).
--               The free tips and sticker forms are the newsletter. The /code quiz keeps its own quiz_leads.
-- The admin is a Supabase auth user with app_metadata.role = 'admin' (set only with the secret key).

create table public.page_views (
  id bigint generated always as identity primary key,
  visitor_id uuid not null,
  session_id uuid not null,
  path text not null,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device text check (device in ('mobile', 'tablet', 'desktop')),
  country text,
  created_at timestamptz not null default now()
);
create index page_views_created_at_idx on public.page_views (created_at);

create table public.signups (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email)),
  form text not null,
  page text,
  details jsonb,
  utm_source text,
  visitor_id uuid,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (email, form)
);
create index signups_created_at_idx on public.signups (created_at);

-- ---------- row level security: no access for browsers ----------

alter table public.page_views enable row level security;
alter table public.signups enable row level security;
revoke all on public.page_views, public.signups from anon, authenticated;

-- ---------- numbers for /admin ----------

-- Page views, unique visitors and visits per day (UTC).
create function public.traffic_daily(since timestamptz)
returns table (day date, views bigint, visitors bigint, sessions bigint)
language sql stable set search_path = '' as $$
  select v.created_at::date, count(*), count(distinct v.visitor_id), count(distinct v.session_id)
  from public.page_views v
  where v.created_at >= since
  group by 1
  order by 1
$$;

-- Totals for the period: views, visitors, visits, visits that saw only one page, visitors seen before the period.
create function public.traffic_totals(since timestamptz)
returns table (views bigint, visitors bigint, sessions bigint, bounced bigint, returning_visitors bigint)
language sql stable set search_path = '' as $$
  with v as (select * from public.page_views where created_at >= since),
       per_session as (select session_id, count(*) as n from v group by 1)
  select (select count(*) from v),
         (select count(distinct visitor_id) from v),
         (select count(*) from per_session),
         (select count(*) from per_session where n = 1),
         (select count(distinct v.visitor_id) from v
            where exists (select 1 from public.page_views o where o.visitor_id = v.visitor_id and o.created_at < since))
$$;

-- The top 25 of each breakdown: page, referrer, source (UTM), campaign, device, country, landing page.
create function public.traffic_top(since timestamptz)
returns table (kind text, label text, views bigint, visitors bigint)
language sql stable set search_path = '' as $$
  with v as (select * from public.page_views where created_at >= since),
       landing as (
         select distinct on (session_id) session_id, visitor_id, path
         from v order by session_id, created_at
       ),
       grouped as (
         select 'page' as kind, path as label, count(*) as views, count(distinct visitor_id) as visitors from v group by 2
         union all
         select 'referrer', coalesce(referrer, 'direct'), count(*), count(distinct visitor_id) from v group by 2
         union all
         select 'source', coalesce(utm_source, 'none'), count(*), count(distinct visitor_id) from v group by 2
         union all
         select 'campaign', utm_campaign, count(*), count(distinct visitor_id) from v where utm_campaign is not null group by 2
         union all
         select 'device', coalesce(device, 'unknown'), count(*), count(distinct visitor_id) from v group by 2
         union all
         select 'country', coalesce(country, 'unknown'), count(*), count(distinct visitor_id) from v group by 2
         union all
         select 'landing', path, count(*), count(distinct visitor_id) from landing group by 2
       )
  select kind, label, views, visitors from (
    select g.*, row_number() over (partition by g.kind order by g.views desc, g.label) as rank from grouped g
  ) ranked
  where rank <= 25
$$;

-- Newsletter and form signups per form and day (UTC).
create function public.signups_daily(since timestamptz)
returns table (day date, form text, signups bigint)
language sql stable set search_path = '' as $$
  select s.created_at::date, s.form, count(*)
  from public.signups s
  where s.created_at >= since
  group by 1, 2
  order by 1
$$;

-- Per site form, plus the /code quiz: all signups ever, those still subscribed, and those new in the period.
-- For the quiz, "subscribed" means ticked the weekly tips and hasn't left.
create function public.signups_summary(since timestamptz)
returns table (form text, total bigint, subscribed bigint, in_period bigint)
language sql stable set search_path = '' as $$
  select s.form, count(*), count(*) filter (where s.unsubscribed_at is null), count(*) filter (where s.created_at >= since)
  from public.signups s
  group by 1
  union all
  select 'quiz', count(*), count(*) filter (where q.tips_consent and q.unsubscribed_at is null), count(*) filter (where q.created_at >= since)
  from public.quiz_leads q
$$;

-- Unique newsletter emails: signed up on one of the newsletter forms (lib/analytics.ts) or ticked the quiz's weekly tips.
create function public.newsletter_subscribers(forms text[])
returns bigint
language sql stable set search_path = '' as $$
  select count(*) from (
    select s.email from public.signups s where s.form = any (forms) and s.unsubscribed_at is null
    union
    select q.email from public.quiz_leads q where q.tips_consent and q.unsubscribed_at is null
  ) emails
$$;

revoke execute on function public.traffic_daily(timestamptz), public.traffic_totals(timestamptz), public.traffic_top(timestamptz),
  public.signups_daily(timestamptz), public.signups_summary(timestamptz), public.newsletter_subscribers(text[])
  from public, anon, authenticated;
grant execute on function public.traffic_daily(timestamptz), public.traffic_totals(timestamptz), public.traffic_top(timestamptz),
  public.signups_daily(timestamptz), public.signups_summary(timestamptz), public.newsletter_subscribers(text[])
  to service_role;
