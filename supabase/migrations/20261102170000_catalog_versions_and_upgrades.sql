-- Existing and in-flight purchases keep the catalogue promised when checkout started.
alter table public.orders add column catalog_version smallint not null default 1 check (catalog_version in (1, 2));
alter table public.orders add column parent_order_id uuid references public.orders(id);
create unique index orders_one_reset_upgrade on public.orders(parent_order_id) where parent_order_id is not null;

-- Claim once before contacting Creem. Concurrent clicks reuse one hosted checkout.
create table public.order_upgrades (
  parent_order_id uuid primary key references public.orders(id),
  checkout_url text,
  state text not null default 'creating' check (state in ('creating', 'ready', 'paid', 'failed')),
  created_at timestamptz not null default now()
);
alter table public.order_upgrades enable row level security;
revoke all on public.order_upgrades from anon, authenticated;
