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
  "reset-waitlist": { label: "30-Day Reset waitlist · /, /pricing, thank-you", newsletter: false },
  "crew-club-waitlist": { label: "Crew Club waitlist · /, /pricing", newsletter: false },
  b2b: { label: "Schools and teams · /schools", newsletter: false },
} as const;

export type SignupForm = keyof typeof SIGNUP_FORMS;
export const isSignupForm = (s: unknown): s is SignupForm => typeof s === "string" && Object.hasOwn(SIGNUP_FORMS, s);
export const NEWSLETTER_FORMS = (Object.keys(SIGNUP_FORMS) as SignupForm[]).filter((f) => SIGNUP_FORMS[f].newsletter);

/** The team's pages and the API are not site visits. */
export const UNTRACKED = /^\/(admin|stats|dev|api)(\/|$)/;

/** The social app whose built-in browser opened the site, from its user agent. These browsers often send no referrer,
 *  so without this a visit from a TikTok or Instagram bio link looks "direct". Instagram is checked before Facebook:
 *  its user agent can carry Facebook's tokens too. */
const APPS: [string, RegExp][] = [
  ["instagram", /Instagram/i],
  ["tiktok", /musical_ly|TikTok|BytedanceWebview|ByteLocale/i],
  ["facebook", /FBAN|FBAV|FB_IAB|FBIOS/],
  ["snapchat", /Snapchat/i],
  ["pinterest", /Pinterest/i],
  ["linkedin", /LinkedInApp/i],
  ["x", /Twitter/i],
];
export const inAppBrowser = (ua: string) => APPS.find(([, re]) => re.test(ua))?.[0] ?? null;

/** Tags this visit in Microsoft Clarity (components/Clarity.tsx), so recordings can be filtered by video or A/B variant.
 *  Queues the call the same way Clarity's own snippet does, so it works before the tag has loaded. */
export function clarityTag(key: string, value: string) {
  type Queue = ((...args: unknown[]) => void) & { q?: unknown[][] };
  const w = window as unknown as { clarity?: Queue };
  w.clarity ??= Object.assign((...args: unknown[]) => (w.clarity!.q ??= []).push(args), {});
  w.clarity("set", key, value);
}
