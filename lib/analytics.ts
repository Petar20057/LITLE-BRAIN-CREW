// The site's own visit counting (components/Track.tsx → app/api/track) and form signups (design/assets/site.js →
// app/api/signup), read by /admin. Shared by the browser and the server, so nothing here may be server-only.

/** Every email form on the design pages (data-form="…"). The gift form is a checkout, not a signup. */
export const SIGNUP_FORMS = {
  "free-screen-list": { label: "Free screen-time list · /free", newsletter: true },
  "sticker-pack": { label: "Sticker pack · /free", newsletter: true },
  "screen-off-challenge": { label: "5-day Screen-Off Challenge · /free", newsletter: true },
  "coming-next": { label: "Coming next waitlist · /founding", newsletter: false },
  "founding-parents": { label: "Founding parents · /founding", newsletter: false },
  "shop-waitlist": { label: "Shop waitlist · /shop", newsletter: false },
  b2b: { label: "Schools and teams · /schools", newsletter: false },
} as const;

export type SignupForm = keyof typeof SIGNUP_FORMS;
export const isSignupForm = (s: unknown): s is SignupForm => typeof s === "string" && Object.hasOwn(SIGNUP_FORMS, s);
export const NEWSLETTER_FORMS = (Object.keys(SIGNUP_FORMS) as SignupForm[]).filter((f) => SIGNUP_FORMS[f].newsletter);

/** The team's pages and the API are not site visits. */
export const UNTRACKED = /^\/(admin|stats|dev|api)(\/|$)/;
