-- Deeper analytics and A/B tests (2026-10-30): who came, what they saw, where they left, what they bought.
--   page_views     gains view_id (random id of one page shown, so the "left the page" beacon can find its row),
--                  utm_content (which video or post sent the visit), app (the in-app browser: instagram, tiktok,
--                  facebook, snapchat, pinterest, linkedin, x), seconds (time the page was visible) and max_scroll
--                  (how far down it got, 0–100). Still no IP address and no user agent.
--   funnel_events  new browser events  cta_click     a button that leads on, not to a checkout (place = which one)
--                                      section_view  a page section seen (place = its id)
--                                      ab_view       an A/B test seen (place = test:variant, lib/experiments.ts)
--                  purchase rows now fill visitor_id and session_id (sent through Creem's checkout metadata,
--                  lib/delivery.ts), so a sale can be traced back to the visit, its source, video and A/B variants.
--                  The orders table is not touched, so order recording never depends on this migration.
-- New numbers for /admin: exit pages, videos and apps in traffic_top; page_engagement, section_reach, funnel_by and
-- experiment_results. Additive: apply it, then deploy, then npm run db:types.

alter table public.page_views
  add column view_id uuid,
  add column utm_content text,
  add column app text,
  add column seconds integer check (seconds between 0 and 3600),
  add column max_scroll smallint check (max_scroll between 0 and 100);
create index page_views_view_id_idx on public.page_views (view_id);
create index page_views_session_idx on public.page_views (session_id, created_at);

alter table public.funnel_events drop constraint funnel_events_name_check;
alter table public.funnel_events add constraint funnel_events_name_check check (name in (
  'buy_click', 'checkout_view', 'bump_checked', 'purchase', 'post_bump_purchase', 'email_signup', 'moment_click',
  'checkout_submit', 'offer_view', 'offer_no', 'scroll_depth', 'cta_click', 'section_view', 'ab_view'
));
create index funnel_events_session_idx on public.funnel_events (session_id);
create index funnel_events_visitor_idx on public.funnel_events (visitor_id);

-- ---------- numbers for /admin ----------

-- Same as before, plus three breakdowns: exit (the last page of each visit), content (utm_content) and app.
create or replace function public.traffic_top(since timestamptz)
returns table (kind text, label text, views bigint, visitors bigint)
language sql stable set search_path = '' as $$
  with v as (select * from public.page_views where created_at >= since),
       landing as (
         select distinct on (session_id) session_id, visitor_id, path
         from v order by session_id, created_at
       ),
       exits as (
         select distinct on (session_id) session_id, visitor_id, path
         from v order by session_id, created_at desc
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
         select 'content', utm_content, count(*), count(distinct visitor_id) from v where utm_content is not null group by 2
         union all
         select 'app', coalesce(app, 'browser'), count(*), count(distinct visitor_id) from v group by 2
         union all
         select 'device', coalesce(device, 'unknown'), count(*), count(distinct visitor_id) from v group by 2
         union all
         select 'country', coalesce(country, 'unknown'), count(*), count(distinct visitor_id) from v group by 2
         union all
         select 'landing', path, count(*), count(distinct visitor_id) from landing group by 2
         union all
         select 'exit', path, count(*), count(distinct visitor_id) from exits group by 2
       )
  select kind, label, views, visitors from (
    select g.*, row_number() over (partition by g.kind order by g.views desc, g.label) as rank from grouped g
  ) ranked
  where rank <= 25
$$;

-- Per page (top 40 by views): views, visitors, median seconds visible, average scroll depth, and how many visits ended
-- there. Seconds and scroll only count page views whose "left the page" beacon arrived.
create function public.page_engagement(since timestamptz)
returns table (path text, views bigint, visitors bigint, median_seconds numeric, avg_scroll numeric, exits bigint)
language sql stable set search_path = '' as $$
  with v as (select * from public.page_views where created_at >= since),
       exits as (
         select distinct on (session_id) session_id, path
         from v order by session_id, created_at desc
       ),
       exit_counts as (select e.path, count(*) as n from exits e group by 1)
  select v.path,
         count(*),
         count(distinct v.visitor_id),
         round((percentile_cont(0.5) within group (order by v.seconds) filter (where v.seconds is not null))::numeric, 0),
         round(avg(v.max_scroll) filter (where v.max_scroll is not null), 0),
         coalesce(max(x.n), 0)
  from v left join exit_counts x on x.path = v.path
  group by v.path
  order by count(*) desc
  limit 40
$$;

-- Per page and section: visits that saw the section, next to the page's visits, so /admin can show where people stop.
create function public.section_reach(since timestamptz)
returns table (path text, section text, visits bigint, page_visits bigint)
language sql stable set search_path = '' as $$
  with pv as (
    select p.path, count(distinct p.session_id) as n from public.page_views p where p.created_at >= since group by 1
  )
  select f.path, f.place, count(distinct f.session_id), coalesce(max(pv.n), 0)
  from public.funnel_events f left join pv on pv.path = f.path
  where f.name = 'section_view' and f.place is not null and f.created_at >= since
  group by 1, 2
  order by 1, 3 desc
$$;

-- The purchase funnel per visit, grouped by where the visit came from (its first page view): dim is one of
-- source (utm_source), content (utm_content), app, referrer, landing or device. Top 30 by visits.
create function public.funnel_by(since timestamptz, dim text)
returns table (
  label text, visits bigint, buy_clicks bigint, checkouts bigint, pay_clicks bigint, purchases bigint, revenue_cents bigint
)
language sql stable set search_path = '' as $$
  with first_view as (
    select distinct on (p.session_id) p.session_id,
           case dim
             when 'source' then coalesce(p.utm_source, 'none')
             when 'content' then coalesce(p.utm_content, 'none')
             when 'app' then coalesce(p.app, 'browser')
             when 'referrer' then coalesce(p.referrer, 'direct')
             when 'landing' then p.path
             when 'device' then coalesce(p.device, 'unknown')
             else 'all'
           end as label
    from public.page_views p
    where p.created_at >= since
    order by p.session_id, p.created_at
  ),
  per_session as (
    select f.session_id,
           bool_or(f.name = 'buy_click') as buy_click,
           bool_or(f.name = 'checkout_view') as checkout,
           bool_or(f.name = 'checkout_submit') as pay_click,
           count(*) filter (where f.name = 'purchase') as purchases,
           coalesce(sum(f.amount_cents) filter (where f.name in ('purchase', 'post_bump_purchase')), 0) as revenue_cents
    from public.funnel_events f
    where f.created_at >= since and f.session_id is not null
    group by 1
  )
  select v.label,
         count(*),
         count(*) filter (where s.buy_click),
         count(*) filter (where s.checkout),
         count(*) filter (where s.pay_click),
         coalesce(sum(s.purchases), 0)::bigint,
         coalesce(sum(s.revenue_cents), 0)::bigint
  from first_view v left join per_session s on s.session_id = v.session_id
  group by 1
  order by 2 desc
  limit 30
$$;

-- A/B tests: per test and variant, the visitors who saw it (ab_view, their first exposure counts) and what they did
-- afterwards, on any later visit: buy clicks, checkouts, pay clicks, purchases and revenue (purchase rows carry the
-- visitor since this migration).
create function public.experiment_results(since timestamptz)
returns table (
  test text, variant text, visitors bigint, buy_clickers bigint, checkouts bigint, pay_clickers bigint,
  purchasers bigint, purchases bigint, revenue_cents bigint
)
language sql stable set search_path = '' as $$
  with seen as (
    select distinct on (f.visitor_id, split_part(f.place, ':', 1))
           f.visitor_id, split_part(f.place, ':', 1) as test, split_part(f.place, ':', 2) as variant, f.created_at as at
    from public.funnel_events f
    where f.name = 'ab_view' and f.visitor_id is not null and f.place like '%:%' and f.created_at >= since
    order by f.visitor_id, split_part(f.place, ':', 1), f.created_at
  ),
  outcome as (
    select s.test, s.variant, s.visitor_id,
           bool_or(e.name = 'buy_click') as buy_click,
           bool_or(e.name = 'checkout_view') as checkout,
           bool_or(e.name = 'checkout_submit') as pay_click,
           count(e.id) filter (where e.name = 'purchase') as purchases,
           coalesce(sum(e.amount_cents) filter (where e.name in ('purchase', 'post_bump_purchase')), 0) as revenue_cents
    from seen s
    left join public.funnel_events e on e.visitor_id = s.visitor_id and e.created_at >= s.at
      and e.name in ('buy_click', 'checkout_view', 'checkout_submit', 'purchase', 'post_bump_purchase')
    group by 1, 2, 3
  )
  select o.test, o.variant,
         count(*),
         count(*) filter (where o.buy_click),
         count(*) filter (where o.checkout),
         count(*) filter (where o.pay_click),
         count(*) filter (where o.purchases > 0),
         coalesce(sum(o.purchases), 0)::bigint,
         coalesce(sum(o.revenue_cents), 0)::bigint
  from outcome o
  group by 1, 2
  order by 1, 2
$$;

revoke execute on function public.page_engagement(timestamptz), public.section_reach(timestamptz),
  public.funnel_by(timestamptz, text), public.experiment_results(timestamptz)
  from public, anon, authenticated;
grant execute on function public.page_engagement(timestamptz), public.section_reach(timestamptz),
  public.funnel_by(timestamptz, text), public.experiment_results(timestamptz)
  to service_role;
