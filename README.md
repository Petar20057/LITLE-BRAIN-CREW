# Little Brain Crew — website

Next.js (App Router) site for Little Brain Crew (littlebraincrew.com). Marketing pages come from the static design in `design/`; the checkout, offers, membership and support pages are Next.js pages. How the funnel works and why: [FUNNEL.md](FUNNEL.md).

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run sync    # after editing anything in design/
npm run lint
npm test        # unit tests (tests/, Vitest): webhook, quiz email gate, forms, opt-in, unsubscribe
npm run build
npm run verify  # all of the above plus check:learn: run before every commit
```

CI (`.github/workflows/ci.yml`) runs the same checks on every push and pull request, with no secrets. Make it a required check on `main` (GitHub → Settings → Branches) so Vercel only deploys commits that passed.

## Marketing pages (from `design/`)

Every `design/<name>.html` is served at `/<name>` (`index.html` is `/`): `/`, `/pricing`, `/ask`, `/free`, `/gift`, `/shop`, `/founding`, `/schools`, `/faq`, `/dopa`. A page's `<meta name="robots">` is honored (`/dopa` is `noindex,follow` and left out of the sitemap). The home page sells the ebook, the 30-Day Reset and the Crew Club side by side. `dopa` is an ad landing page (`data-ad="1"`, no links that leave the page). The free quiz was removed; `/quiz` redirects to `/#plans` (`next.config.ts`).

- Edit copy in `design/*.html`, shared header and footer in `design/partials/`, styles in `design/assets/site.css` (the original design) and `design/assets/additions.css` (everything added since), behavior in `design/assets/site.js`.
- `npm run sync` copies `design/assets`, `stickers`, `og.jpg` and `favicon.svg` into `public/`, and turns each page into `content/pages/<name>.json`, writes `content/partials/` and `content/art.json` (see Learn pages), and fills the empty `data-char` divs with the drawn crew so crawlers see them. Don't hand-edit `content/pages/`, `content/partials/`, `content/art.json` or `public/assets/`.
- `components/DesignPage.tsx` renders a page; `components/PageScripts.tsx` runs the design's scripts in order after it. Links between design pages are plain `<a>` on purpose: each page load must start its scripts fresh.
- `design/` started as a copy of a colleague's claude.ai artifact (https://claude.ai/artifact/6nXbBgQqfLDusxDyZHRPex) and has since been restructured, so new versions of that artifact need merging by hand.

## Learn pages (Next.js, `app/(learn)/`)

SEO content, rendered as server components with the same global CSS classes as the design (so they look like the rest of the site). The text lives in typed data, not in the routes.

| Route | What |
|---|---|
| `/learn` | All hubs. `/crew`: the 26 characters. `/glossary`, `/sources` |
| `/brain-chemicals`, `/brain-parts`, `/habits`, `/ages`, `/why`, `/what-to-say`, `/myths`, `/guides` | Hubs; each entry is `/<section>/<slug>` |
| `/about`, `/editorial-policy`, `/privacy`, `/terms` | Text pages from `content/learn/site-pages.ts` (yellow `.draft` label when `draft: true`) |
| `/og/<section>/<slug>` | Generated 1200x630 card for each entry |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt` | Generated from the same data |

- Data: `content/learn/` (`types.ts` shape, `sections.ts` registry of every planned slug, `sources.ts`, one file per section, `glossary.ts`, `site-pages.ts`). Components: `components/learn/`. Helpers: `lib/learn.ts` (characters, path lookup), `lib/seo.ts` (metadata), `lib/jsonld.ts` (structured data), `lib/og.tsx` (cards).
- **Add a page:** add its slug to `content/learn/sections.ts`, write the entry in the section's data file, run `npm run check:learn`, then `npm run build`. No route file is needed: each section folder already has `page.tsx` and `[slug]/page.tsx`. A planned slug with no entry yields no page.
- `npm run check:learn` checks length, sources, related links, FAQ counts, banned words and repeated sentences, and prints a summary. It exits 1 on any problem.
- Header, footer and the drawn crew come from `npm run sync`: `content/partials/{header,footer}.json` and `content/art.json` (inner SVG of each character in three moods). Don't hand-edit them. Links from the shared header/footer to Learn routes are absolute paths (`/crew`, `/why`), because Learn routes are not in `design/`.
- Links between pages are plain `<a>` on purpose, as on the design pages: `site.js` (mom/dad switch, progress bar) must start fresh on each page load.
- Not-yet-written or unknown slugs answer 404 (`notFound()`). With `cacheComponents`, the very first request for a never-seen URL can still return status 200 with a `noindex` robots tag before the 404 is cached; that is Next's streaming behavior, also true for the root `[slug]` route.

## Funnel pages (Next.js, `app/(funnel)/`)

| Route | What |
|---|---|
| `/checkout/guide`, `/checkout/program`, `/checkout/club` | Order page with order bump and email, then Creem checkout (card, Apple Pay, Google Pay) |
| `/offer/upgrade`, `/offer/screen-off-week`, `/offer/club` | One-click upsells and downsells after payment |
| `/account/affiliate`, `/affiliate` | Members-only affiliate program (20%) on Creem: rules, invite request, share kit |
| `/thank-you` | Order summary and next steps |
| `/support` | “Support the crew”, pay what you want (not a donation) |
| `/account`, `/account/cancel` | Crew Club account and the cancel flow (pause, downgrade, save offers) |

- Prices, products and the order of offers: `lib/funnel.ts`.
- Order state across the steps: `lib/order.ts` (sessionStorage for now).
- Payments: `lib/payments.ts`. **Preview mode:** nothing is charged until Creem is connected there (see FUNNEL.md §7).

## Known gaps

- `/downloads/crew-stickers.zip` is linked on `/free` but the file doesn't exist yet.
- The free screen-time list and the 5-day challenge emails aren't written yet: signing up only sends the confirmation link.
- Yellow “draft” labels mark text waiting for an OK: the Privacy policy and Terms, Club content and launch date, guide page numbers.
- Testimonials stay empty until there are real ones.
- File delivery for paid products isn't built, so payments stay off (`COMING_SOON` in `next.config.ts` and `lib/funnel.ts`).

## Environment

Copy `.env.example` to `.env.local`. `NEXT_PUBLIC_SITE_URL` is the public origin (canonical URLs, Open Graph, JSON-LD, sitemap). Leave it empty: production builds use `https://www.littlebraincrew.com`, local dev `http://localhost:3000`. Keep unused keys empty.

## Email

Sending goes through Amazon SES in `eu-north-1`, where `littlebraincrew.com` is a verified domain (Easy DKIM, MAIL FROM `mail.littlebraincrew.com`, records in Vercel DNS). Receiving stays on Hostinger (root MX). The account is out of the SES sandbox.

- Code: `lib/email/send.ts` (SES), `lib/email/layout.ts` (the site's look, HTML and text from the same blocks), `lib/email/templates.ts` (Club welcome, order receipt, renewal reminder).
- Wired: the Creem webhook sends the Club welcome once per new subscription. The order receipt waits for file delivery; the renewal reminder waits for a daily job.
- Preview in dev: `/dev/emails` (404 in production). Send yourself one: `curl -X POST "localhost:3000/dev/emails/club-welcome?to=you@example.com"`.
- Crew images for email are PNGs in `public/email/crew/` (`npm run email:art` re-renders them from the site's art, macOS).

**Keys.** In AWS IAM, create a user (e.g. `littlebraincrew-ses`) with only this inline policy, create an access key for it, and put it in `.env.local` and Vercel as `SES_ACCESS_KEY_ID` / `SES_SECRET_ACCESS_KEY`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": ["ses:SendEmail", "ses:SendRawEmail"], "Resource": "arn:aws:ses:eu-north-1:*:identity/littlebraincrew.com" }
  ]
}
```

**Staying out of spam** (already done in code and DNS unless marked):
- SPF, DKIM and DMARC all pass and align with the From domain; From is always `hello@littlebraincrew.com`. `EMAIL_REPLY_TO` must be a mailbox that exists in Hostinger.
- Every email has a text part, alt text on images, real links only to our own domain, no link shorteners, and stays far under Gmail's 102 KB clipping.
- Copy stays calm: no "free!!!", no all caps, no promises (also the brand rule).
- Mail people signed up for (newsletters, challenges) must pass `unsubscribeUrl` to `sendEmail`, which adds one-click `List-Unsubscribe` headers that Gmail and Yahoo require from bulk senders. Receipts and account emails don't.
- SES drops addresses that bounced or complained (account suppression list). Keep bounces under 2% and complaints under 0.1%.
- To do: after a few weeks of clean sending, move DMARC from `p=none` to `p=quarantine`, and add a `rua=` report address. Start with low volume and only ever mail people who asked.

## Email lists: double opt-in and unsubscribe

- Newsletter forms (`NEWSLETTER_FORMS` in `lib/analytics.ts`) and the /code weekly-tips tick count only after the person taps the link in the email we send (`signups.confirmed_at`, `quiz_leads.tips_consent`). Waitlists, founding parents and schools have nothing to confirm.
- Links: `/confirm?t=<token>` and `/unsubscribe?t=<token>` are pages with a button (mail scanners open links, they don't press buttons). `/api/unsubscribe?t=<token>` is the one-click POST for the `List-Unsubscribe` header: pass `${EMAIL_BASE}/api/unsubscribe?t=<token>` as `unsubscribeUrl` to `sendEmail` for every list email. One unsubscribe takes the address off every list. Logic: `lib/consent.ts`.
- The CSV export (`/admin/newsletter/export`) marks `newsletter = yes` only for confirmed, still-subscribed rows. Mail only those.
- Rows from before 27 Oct 2026 were kept as confirmed (they signed up under the old form).

## Abuse limits

Public routes count requests per client IP in `rate_limits` (`lib/rate-limit.ts`, limits in `LIMITS`): over the limit the email gate, forms and checkout answer 429, page views and quiz clicks are dropped. The IP is stored only as an HMAC keyed with the Supabase secret key. On top of that the /code gate sends one result email per quiz visit and one per address a day, and a newsletter form one confirmation per address and form a day.

## Database (Supabase)

- Schema lives in `supabase/migrations/`, applied in file order. Never edit an applied migration; add a new file.
- **Apply a migration:** Supabase dashboard → SQL Editor → paste the file → Run (or `supabase db push` with the CLI linked to the project). Apply it **before** deploying code that needs it. Then `npm run db:types` and commit the regenerated `lib/supabase/database.types.ts`.
- Pending as of 27 Oct 2026: `20261027120000_abuse_controls_consent.sql` (rate limits, double opt-in, webhook event order, retention). `database.types.ts` was edited by hand for it; regenerate after applying.
- Admin account: `node scripts/create-admin.mjs <email>` (creates it or resets its password; prints it once).

## Retention and deletion

- `prune_old_data()` deletes page views and quiz visits (with their clicks) older than 13 months and rate-limit rows older than a day. It runs daily at 03:17 UTC through pg_cron, if pg_cron was enabled (Database → Extensions) before the migration ran. Otherwise enable it, then run once in the SQL Editor: `select cron.schedule('prune-old-data', '17 3 * * *', 'select public.prune_old_data()');`. The privacy policy promises the 13 months, so check the job exists (`select * from cron.job;`).
- **Someone asks to be deleted:** `node scripts/delete-person.mjs <email>` (dry run, counts only), then again with `--yes`. It prints the manual steps that follow (SES suppression list, Hostinger inbox, Creem, reply).

## Operations

- **Deploy:** push to `main` → Vercel builds and deploys production. Preview deployments must not get production keys (Vercel → Settings → Environment Variables: scope Supabase, SES and Creem keys to Production; give Preview a separate Supabase project).
- **Rollback:** Vercel → Deployments → pick the last good one → Promote to Production (no rebuild). The database doesn't roll back with it: migrations only add, so older code keeps working on the newer schema. A migration that removes or renames something needs its reverse SQL written before it's applied.
- **Backups:** depend on the Supabase plan (Database → Backups). Check that daily backups exist and how long they're kept. Before payments go live, rehearse a restore into a *new* project (never over production): restore, point a local `.env.local` at it, run `npm run dev` and open `/admin`. Write the date and result here.
- **Something is broken:** Vercel → project → Logs (filter by `[creem]`, `[quiz]`, `[signup]`, `[email]`, `[rate-limit]`). Creem retries a failed webhook 4 times over about 6 hours, then stops: after a fix, resend failed events from the Creem dashboard. SES bounces and complaints: AWS console → SES → Reputation metrics.
- **Monitoring (to set up):** an uptime check on `/` and `/code`, error alerts from Vercel, and SES/AWS budget alarms, all to hello@littlebraincrew.com.

## Stack

GitHub (`Petar20057/LITLE-BRAIN-CREW`, this folder is the repo root) → Vercel, Supabase for members, subscriptions, form signups, quiz data and the admin login, Amazon SES for email, Creem (merchant of record) for payments and the affiliate program.
