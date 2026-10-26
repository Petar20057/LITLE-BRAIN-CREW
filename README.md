# Vibe Life Code — website

Next.js (App Router) site for VIBE LIFE CODE. Marketing pages come from the static design in `design/`; the checkout, offers, membership and support pages are Next.js pages. How the funnel works and why: [FUNNEL.md](FUNNEL.md).

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run sync    # after editing anything in design/
npm run build   # verify before every commit
npm run lint
```

## Marketing pages (from `design/`)

Every `design/<name>.html` is served at `/<name>` (`index.html` is `/`): `/`, `/pricing`, `/ask`, `/free`, `/gift`, `/shop`, `/founding`, `/schools`, `/faq`, `/dopa`. The home page sells the ebook, the 30-Day Reset and the Crew Club side by side. `dopa` is an ad landing page (`data-ad="1"`, no links that leave the page). The free quiz was removed; `/quiz` redirects to `/#plans` (`next.config.ts`).

- Edit copy in `design/*.html`, shared header and footer in `design/partials/`, styles in `design/assets/site.css` (the original design) and `design/assets/additions.css` (everything added since), behavior in `design/assets/site.js`.
- `npm run sync` copies `design/assets`, `stickers`, `og.jpg` and `favicon.svg` into `public/`, and turns each page into `content/pages/<name>.json`. Don't hand-edit `content/pages/` or `public/assets/`.
- `components/DesignPage.tsx` renders a page; `components/PageScripts.tsx` runs the design's scripts in order after it. Links between design pages are plain `<a>` on purpose: each page load must start its scripts fresh.
- `design/` started as a copy of a colleague's claude.ai artifact (https://claude.ai/artifact/6nXbBgQqfLDusxDyZHRPex) and has since been restructured, so new versions of that artifact need merging by hand.

## Funnel pages (Next.js, `app/(funnel)/`)

| Route | What |
|---|---|
| `/checkout/guide`, `/checkout/program`, `/checkout/club` | Order page with order bump, email, card or PayPal |
| `/offer/upgrade`, `/offer/split`, `/offer/club`, `/offer/club-lite` | One-click upsells and downsells after payment |
| `/thank-you` | Order summary and next steps |
| `/support` | “Support the crew”, pay what you want (not a donation) |
| `/account`, `/account/cancel` | Crew Club account and the cancel flow (pause, downgrade, save offers) |

- Prices, products and the order of offers: `lib/funnel.ts`.
- Order state across the steps: `lib/order.ts` (sessionStorage for now).
- Payments: `lib/payments.ts`. **Preview mode:** nothing is charged until Stripe and PayPal are connected there (see FUNNEL.md §7).

## Known gaps

- `/downloads/crew-stickers.zip` is linked on `/free` but the file doesn't exist yet.
- Yellow “draft” labels on the site mark text waiting for an OK: guarantee and refund terms, Club content and launch date, company name and emails, guide page numbers.
- Testimonials stay empty until there are real ones.

## Environment

Copy `.env.example` to `.env.local`. `NEXT_PUBLIC_SITE_URL` is the public origin (canonical URLs, Open Graph, JSON-LD). Keep unused keys empty.

## Planned stack

GitHub → Vercel (Root Directory `web` if the repo is the parent folder), Supabase for orders, members and form submissions, Stripe and PayPal for payments.
