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

Every `design/<name>.html` is served at `/<name>` (`index.html` is `/`): `/`, `/toolkit`, `/reset`, `/pricing`, `/ask`, `/free`, `/gift`, `/shop`, `/founding`, `/schools`, `/faq`, `/dopa`. `/toolkit` is the sales page for the one product (the Toolkit holds the Reset, the Science Edition, the Complete Crew Guide and the bonuses since 2026-11-04; real PDF pages in `design/assets/samples/`, FUNNEL.md §20–21); `/pricing` is the plans overview (Toolkit and Personal plan). A page's `<meta name="robots">` is honored (`/dopa` is `noindex,follow` and left out of the sitemap). The home page sells the ebook, the 30-Day Reset and the Crew Club side by side. `dopa` is an ad landing page (`data-ad="1"`, no links that leave the page). The free quiz was removed; `/quiz` redirects to `/#plans` (`next.config.ts`).

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
| `/checkout/guide`, `/checkout/bedtime` | Order page with order bump and email, then Creem checkout (card, Apple Pay, Google Pay) |
| `/offer/bedtime`, `/offer/screen-off-week` | Post-purchase offers with a prefilled Creem checkout |
| `/thank-you` | Order summary and next steps |
| `/personal-plan`, `/personal-plan/thanks` | The Personal plan ($199): the intake form (in `app/(learn)/`, with the site header), then a Creem checkout; paid requests go to `/admin/personal-plans` and the team inbox (`lib/personal-plan.ts`) |
| `/support` | “Support the crew”, pay what you want (not a donation) |
| `/account` | Account preview (what was bought); real data comes with phase 4 of FUNNEL.md §18. The Crew Club membership and its cancel flow were removed on 2026-11-04 (§19) |

- Prices, products and the order of offers: `lib/funnel.ts`. The Personal plan ($199) is form-only: `/api/checkout` refuses it and there is no `/checkout/personal-plan`.
- Order state across the steps: `lib/order.ts` (sessionStorage for now).
- Payments: `lib/payments.ts`. Payments are live through Creem; PREVIEW is false. Offers still require confirmation on Creem.

## Characters (`/crew`, `/crew/<slug>`)

Every character the site knows is in `content/characters.json`, built by `node scripts/import-characters.mjs [--dry]`
from `content/characters.csv` (the registry: name, pack, access) plus one content file per character,
`content/characters/<slug>.json` (the written page; format and rules in `content/characters/BRIEF.md`). The import
also copies the SVGs from `../characters/svg` into `public/crew-art/`. The 26 drawn in `crew-art.js` are built in (`lib/characters.ts`) and always free. Rules live in
`lib/character-rules.ts`: a locked character's explanation, "What to say", printable and cartoon render only inside
`<Suspense>` after `lib/viewer.ts` has checked the reader (since 2026-11-04 there is no gating at all: an open character has a page, a locked one is a silhouette on /crew whose card leads to the Toolkit checkout, and its text is only in the Complete Crew Guide PDF), so
that text never reaches a browser without the right. Import `@/lib/characters` in server code only. Details and the
state of the phases: `FUNNEL.md` section 18.

## Known gaps

- `/downloads/crew-stickers.zip` is linked on `/free` but the file doesn't exist yet.
- Yellow “draft” labels mark text waiting for an OK: the Privacy policy and Terms, guide page numbers.
- Testimonials stay empty until there are real ones.

## Environment

Copy `.env.example` to `.env.local`. `NEXT_PUBLIC_SITE_URL` is the public origin (canonical URLs, Open Graph, JSON-LD, sitemap). Leave it empty: production builds use `https://www.littlebraincrew.com`, local dev `http://localhost:3000`. Keep unused keys empty.

### Advertising purchase measurement

The signed Creem webhook already records paid orders and their actual amounts in `orders` and `funnel_events` for `/admin`. Meta and TikTok pixels are optional: set `NEXT_PUBLIC_META_PIXEL_ID` and `NEXT_PUBLIC_TIKTOK_PIXEL_ID` in Vercel **Production**, then rebuild. Missing IDs leave their SDKs and consent UI off. No advertising access tokens are needed for these browser pixels.

`components/AdPixels.tsx` loads the configured SDKs on the production domain only after the visitor allows ad cookies. Visitors can decline or withdraw consent through **Ad cookie choices**. Team, account, quiz and token-bearing confirmation routes are excluded. The privacy page describes the events and services.

Events: `PageView` (TikTok `page`), `InitiateCheckout` on payment submission, and `Purchase` only for webhook-confirmed orders returned by `/api/order`. This runs on the post-purchase offer as well as thank-you, including separate paid upgrades. Amounts include discounts; zero remains zero. Stable hashed order IDs and local deduplication prevent refreshes or repeated status polls from sending another purchase. No email, quiz answers or download tokens are sent as event parameters.

Before using purchase optimization, verify a consenting test visit and purchase in both platforms’ **Test Events**, including the actual amount/currency, refresh deduplication and a declined-consent visit. Browser blockers, closed tabs or missing consent can prevent pixel events; the server-side order ledger still counts those sales. Server-to-server Meta Conversions API and TikTok Events API are not configured.

## Email

Sending goes through Amazon SES in `eu-north-1`, where `littlebraincrew.com` is a verified domain (Easy DKIM, MAIL FROM `mail.littlebraincrew.com`, records in Vercel DNS). Receiving stays on Hostinger (root MX). The account is out of the SES sandbox.

- Code: `lib/email/send.ts` (SES), `lib/email/layout.ts` (the site's look, HTML and text from the same blocks), `lib/email/templates.ts` (order receipt, quiz result, confirmations, the free offers and the challenge, the checkout reminder, the Personal plan).
- Wired: the Creem webhook sends the order receipt (with the download links) once per paid order, and the Personal plan emails.
- Preview in dev: `/dev/emails` (404 in production). Send yourself one: `curl -X POST "localhost:3000/dev/emails/order-receipt?to=you@example.com"`.
- Crew images for email are PNGs in `public/email/crew/` (`npm run email:art` re-renders them from the site's art, macOS).

**Design, opens and clicks** (`lib/email/layout.ts`, copy in `templates.ts`, checked by `tests/email.test.ts`):
- The hero band and the notes take the crew member's own color (`CHARS` in `lib/learn.ts`), the Day N of 5 bar uses it too. One layout for every email; add a block type there, not a new HTML in a template.
- One coral button per email (the thing to do); a white outlined `secondary` button for a second choice; a bold `link` for a soft offer. The test fails on a second coral button.
- Dark mode: Apple Mail, iOS and Outlook.com get a dark card and `public/email/logo-white.png`; Gmail does its own inversion. The crew art stays on a white disc because the PNGs have an opaque white background.
- Subject at most 62 characters with the point in the first 40 (a phone cuts there), preheader 30 to 120 characters that adds something the subject doesn't. The quiz result names the crew, the receipt names the product, the confirmation says what is waiting.
- Links to our site get `utm_source=email&utm_medium=lifecycle&utm_campaign=<email>&utm_content=<button>` (`tag()` in layout.ts; not on confirm, unsubscribe, download or legal links, and a link that already has `utm_source` keeps it). `/admin/journey` then shows clicks and sales per email and per button, with no tracking redirect. Opens can't be trusted (Apple Mail Privacy Protection loads every pixel), so clicks are the number to watch.
- Free offers and Day 1 of the challenge invite a reply and ask for a contact (`hello@littlebraincrew.com`): replies and contacts are what keep the rest out of Promotions.

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
- SES rewrites every link through `*.awstrack.me` while click tracking is on for the identity's configuration set (SES console → Configuration sets). That's a third-party domain in every link. Our own UTM tags measure clicks, so turn click and open tracking off there, or set a custom tracking domain on our own domain with HTTPS.
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
- Applied migrations are listed by `npx supabase migration list --db-url "$POSTGRES_URL_NON_POOLING"` (with `.env.local` loaded). `20261027120000_abuse_controls_consent.sql` was applied on 27 Oct 2026 with pg_cron enabled; the `prune-old-data` job runs daily.
- Admin account: `node scripts/create-admin.mjs <email>` (creates it or resets its password; prints it once).

## Retention and deletion

- `prune_old_data()` deletes page views and quiz visits (with their clicks) older than 13 months and rate-limit rows older than a day. It runs daily at 03:17 UTC through pg_cron, if pg_cron was enabled (Database → Extensions) before the migration ran. Otherwise enable it, then run once in the SQL Editor: `select cron.schedule('prune-old-data', '17 3 * * *', 'select public.prune_old_data()');`. The privacy policy promises the 13 months, so check the job exists (`select * from cron.job;`).
- **Someone asks to be deleted:** `node scripts/delete-person.mjs <email>` (dry run, counts only), then again with `--yes`. It prints the manual steps that follow (SES suppression list, Hostinger inbox, Creem, reply).

## Operations

- **Discount codes:** `/admin/discounts` creates percentage codes (1–100%) with a required total usage limit, product selection and optional UTC expiry. Customers enter the code on Creem's payment checkout. Counts come directly from Creem; its `max_redemptions` applies across all customers and products. Codes apply once per purchase. Combined products must be selected to cover order bumps. Set `CREEM_DISCOUNTS_API_KEY` to a key with only `discounts:read` and `discounts:write`, in the same test/live store as `CREEM_LIVE`. If omitted, `CREEM_API_KEY` needs those scopes. No database migration is needed.

- **Deploy:** push to `main` → Vercel builds and deploys production. Preview deployments must not get production keys (Vercel → Settings → Environment Variables: scope Supabase, SES and Creem keys to Production; give Preview a separate Supabase project).
- **Rollback:** Vercel → Deployments → pick the last good one → Promote to Production (no rebuild). The database doesn't roll back with it: migrations only add, so older code keeps working on the newer schema. A migration that removes or renames something needs its reverse SQL written before it's applied.
- **Backups:** depend on the Supabase plan (Database → Backups). Check that daily backups exist and how long they're kept. Before payments go live, rehearse a restore into a *new* project (never over production): restore, point a local `.env.local` at it, run `npm run dev` and open `/admin`. Write the date and result here.
- **Something is broken:** Vercel → project → Logs (filter by `[creem]`, `[quiz]`, `[signup]`, `[email]`, `[rate-limit]`). Creem retries a failed webhook 4 times over about 6 hours, then stops: after a fix, resend failed events from the Creem dashboard. SES bounces and complaints: AWS console → SES → Reputation metrics.
- **Monitoring (to set up):** an uptime check on `/` and `/code`, error alerts from Vercel, and SES/AWS budget alarms, all to hello@littlebraincrew.com.

## Stack

GitHub (`Petar20057/LITLE-BRAIN-CREW`, this folder is the repo root) → Vercel, Supabase for members, subscriptions, form signups, quiz data and the admin login, Amazon SES for email, Creem (merchant of record) for payments and the affiliate program.

## Catalogue v2 (2 November 2026)

Current bundles and prices: Toolkit $19 with its bonuses; Reset $39 with the Reset PDF, tracker and Science Edition; Bedtime $7 as one PDF. The Crew Club waitlist was removed on 2026-11-04 (FUNNEL.md §19). See FUNNEL.md §17. Edit the source design and run npm run sync. The retired marketing HTML lives under design/retired and is not generated. The Personal plan is $199, sold only through its form at `/personal-plan`. Since 2026-11-03 the v2 Toolkit no longer includes the 4 crew cartoons (catalogue v1 buyers keep theirs; the v2 zip must be rebuilt without `Bonuses/Crew-Cartoons/`).

Buyer downloads resolve the catalogue version stored on the paid order. Preserve all v1 paths and ZIPs. New files are under ../products/delivery/v2. The upload script checks both catalogues before upload. Creem product IDs are in lib/creem-products.json. Migration 20261102170000 adds versioned purchases and verified Reset upgrades.

The /api/order and /api/upgrade routes use the original buyer token; a post-purchase upgrade is linked to its paid parent. Confirmation and the 15 Ways delivery email use the actual four-page PDF and its local preview image.
