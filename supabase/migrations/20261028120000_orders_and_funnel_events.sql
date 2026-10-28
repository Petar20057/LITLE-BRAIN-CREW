-- Paid one-time orders (Toolkit, Bedtime Kit), the funnel events from the site, and the daily funnel for /admin.
--
-- Who writes what: only trusted server code with the secret key.
--   orders         one row per paid one-time order, written by the Creem webhook (lib/delivery.ts). It is the list of
--                  buyers (for the later $9 Reset credit) and what each buyer may download. delivery_hash is the
--                  SHA-256 of the download token from the buyer's thank-you page and email; the token itself is never stored.
--                  download_until ends the links (a year from purchase; the owner can change it).
--   funnel_events  one row per step: buy_click, checkout_view, bump_checked, email_signup, moment_click (sent by the
--                  browser through /api/event), and purchase / post_bump_purchase (sent by the server only, from the
--                  Creem webhook, with the amount). The browser never writes purchases.
-- Browsers never touch these tables; /admin reads the daily numbers through funnel_daily().

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  provider_order_id text not null unique,
  email text not null check (email = lower(email)),
  order_key text not null,
  items text[] not null,
  amount_cents integer not null check (amount_cents >= 0),
  delivery_hash text unique,
  download_until timestamptz not null default (now() + interval '365 days'),
  created_at timestamptz not null default now()
);
create index orders_email_idx on public.orders (email);
create index orders_created_at_idx on public.orders (created_at);

create table public.funnel_events (
  id bigint generated always as identity primary key,
  name text not null check (name in ('buy_click', 'checkout_view', 'bump_checked', 'purchase', 'post_bump_purchase', 'email_signup', 'moment_click')),
  visitor_id uuid,
  session_id uuid,
  place text,
  path text,
  amount_cents integer,
  created_at timestamptz not null default now()
);
create index funnel_events_created_at_idx on public.funnel_events (created_at);

-- ---------- row level security: no access for browsers ----------

alter table public.orders enable row level security;
alter table public.funnel_events enable row level security;
revoke all on public.orders, public.funnel_events from anon, authenticated;

-- ---------- numbers for /admin ----------

-- One line per day (UTC): visits (from page_views), visits that clicked a buy button, visits that opened a checkout,
-- purchases, and the purchases that included the $7 Bedtime Kit.
create function public.funnel_daily(since timestamptz)
returns table (day date, visits bigint, buy_clicks bigint, checkouts bigint, purchases bigint, bump_purchases bigint)
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
           count(*) filter (where f.name = 'purchase') as purchases,
           count(*) filter (where f.name = 'purchase' and f.place like '%bedtime-kit%') as bump_purchases
    from public.funnel_events f
    where f.created_at >= since
    group by 1
  )
  select coalesce(v.d, e.d),
         coalesce(v.visits, 0),
         coalesce(e.buy_clicks, 0),
         coalesce(e.checkouts, 0),
         coalesce(e.purchases, 0),
         coalesce(e.bump_purchases, 0)
  from v full join e on e.d = v.d
  order by 1
$$;

revoke execute on function public.funnel_daily(timestamptz) from public, anon, authenticated;
grant execute on function public.funnel_daily(timestamptz) to service_role;
