# Little Brain Crew — website

Next.js (App Router) site for Little Brain Crew (littlebraincrew.com). Marketing pages come from the static design in `design/`; the checkout, offers, membership and support pages are Next.js pages. How the funnel works and why: [FUNNEL.md](FUNNEL.md).

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run sync    # after editing anything in design/
npm run build   # verify before every commit
npm run lint
```

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
- Yellow “draft” labels on the site mark text waiting for an OK: guarantee and refund terms, Club content and launch date, company name and emails, guide page numbers.
- Testimonials stay empty until there are real ones.

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

## Planned stack

GitHub → Vercel (Root Directory `web` if the repo is the parent folder), Supabase for orders, members and form submissions, Creem (merchant of record) for payments and the affiliate program.
