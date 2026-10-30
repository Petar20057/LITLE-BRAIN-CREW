-- The free 5-day Screen-Off Challenge on /free (2026-10-30). Day 1 goes out when the address is confirmed
-- (lib/consent.ts → lib/free-offers.ts); app/api/cron/challenge sends Days 2–5, one a day.
--   signups.challenge_day      last day sent (1–5), null for every other form and before confirming
--   signups.challenge_sent_at  when that day went out
-- Additive: apply it, then deploy.

alter table public.signups add column challenge_day smallint check (challenge_day between 1 and 5);
alter table public.signups add column challenge_sent_at timestamptz;
