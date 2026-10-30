-- Conversion plan, step 0 (2026-10-29): measure every step between a visit and the money.
--   new browser events  checkout_submit  "Continue to payment" pressed on our checkout (place = order key)
--                       offer_view       an upsell/downsell page seen (place = offer slug)
--                       offer_no         its "No thanks" pressed
--                       scroll_depth     how far down the home page a visit got (place = 25, 50, 75 or 100)
--   upsells paid        post_bump_purchase already exists; the webhook now also writes it for the $30 upgrade.
-- funnel_daily gains: pay clicks, upsell views, upsell purchases and revenue, so /admin can show money per visit.

alter table public.funnel_events drop constraint funnel_events_name_check;
alter table public.funnel_events add constraint funnel_events_name_check check (name in (
  'buy_click', 'checkout_view', 'bump_checked', 'purchase', 'post_bump_purchase', 'email_signup', 'moment_click',
  'checkout_submit', 'offer_view', 'offer_no', 'scroll_depth'
));

-- The return type changes, so the function is dropped and made again.
drop function public.funnel_daily(timestamptz);

create function public.funnel_daily(since timestamptz)
returns table (
  day date, visits bigint, buy_clicks bigint, checkouts bigint, pay_clicks bigint, purchases bigint, bump_purchases bigint,
  offer_views bigint, post_purchases bigint, revenue_cents bigint
)
language sql stable set search_path = '' as $$
  with v as (
    select p.created_at::date as d, count(distinct p.session_id) as visits
    from public.page_views p
    where p.created_at >= since
    group by 1
  ),
  e as (
    select f.created_at::date as d,
           count(distinct f.session_id) filter (where f.name = 'buy_click') as buy_clicks,
           count(distinct f.session_id) filter (where f.name = 'checkout_view') as checkouts,
           count(distinct f.session_id) filter (where f.name = 'checkout_submit') as pay_clicks,
           count(*) filter (where f.name = 'purchase') as purchases,
           count(*) filter (where f.name = 'purchase' and f.place like '%bedtime-kit%') as bump_purchases,
           count(distinct f.session_id) filter (where f.name = 'offer_view') as offer_views,
           count(*) filter (where f.name = 'post_bump_purchase') as post_purchases,
           coalesce(sum(f.amount_cents) filter (where f.name in ('purchase', 'post_bump_purchase')), 0) as revenue_cents
    from public.funnel_events f
    where f.created_at >= since
    group by 1
  )
  select coalesce(v.d, e.d),
         coalesce(v.visits, 0),
         coalesce(e.buy_clicks, 0),
         coalesce(e.checkouts, 0),
         coalesce(e.pay_clicks, 0),
         coalesce(e.purchases, 0),
         coalesce(e.bump_purchases, 0),
         coalesce(e.offer_views, 0),
         coalesce(e.post_purchases, 0),
         coalesce(e.revenue_cents, 0)::bigint
  from v full join e on e.d = v.d
  order by 1
$$;

revoke execute on function public.funnel_daily(timestamptz) from public, anon, authenticated;
grant execute on function public.funnel_daily(timestamptz) to service_role;

-- How far down the home page visits get, for /admin (share of home visits reaching each mark).
create function public.scroll_depth(since timestamptz)
returns table (mark text, visits bigint)
language sql stable set search_path = '' as $$
  select f.place, count(distinct f.session_id)
  from public.funnel_events f
  where f.name = 'scroll_depth' and f.place in ('25', '50', '75', '100') and f.created_at >= since
  group by 1
  order by f.place::int
$$;

revoke execute on function public.scroll_depth(timestamptz) from public, anon, authenticated;
grant execute on function public.scroll_depth(timestamptz) to service_role;
