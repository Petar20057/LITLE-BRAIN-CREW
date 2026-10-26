import { ITEMS, PRODUCTS, per, total, usd, type Item } from "@/lib/funnel";
import { renderEmail, type Block, type Email } from "./layout";

// Every email we send. Copy follows the site (English, calm, no hype, no promises about a child): words like
// "free", "guaranteed", ALL CAPS and piles of exclamation marks are spam signals as much as they're off-brand.

/** Sent once, when a parent's Crew Club subscription first shows up in the Creem webhook. */
export function clubWelcome(plan: "monthly" | "yearly"): Email {
  const item = plan === "yearly" ? ITEMS.clubYearly : ITEMS.clubMonthly;
  const includes = PRODUCTS.club.get.filter((g) => !g.startsWith("Pause or cancel"));
  return renderEmail({
    subject: "Welcome to the Crew Club",
    preheader: "What your membership includes, and how to pause or cancel anytime.",
    kick: "you're in",
    title: "Welcome to the Crew Club",
    art: "duo",
    blocks: [
      { p: "Thanks for joining. The crew keeps growing with your kid, and members meet every new crew member first." },
      { p: "Here’s what your membership includes:" },
      { list: includes },
      { rows: [["Your plan", plan === "yearly" ? "Yearly" : "Monthly"], ["Price", per(item)]] },
      { button: { label: "Open my account", url: "/account" } },
      {
        note:
          plan === "yearly"
            ? "We email you a week before your membership renews. Pause or cancel anytime in your account, in 2 clicks."
            : "Pause or cancel anytime in your account, in 2 clicks. No calls, no emails needed.",
      },
    ],
    reason: "You’re getting this email because you joined the Crew Club at littlebraincrew.com.",
  });
}

const ART: Record<string, string> = { guide: PRODUCTS.guide.art, program: PRODUCTS.program.art, upgrade: PRODUCTS.program.art, "screen-off-week": "dopa" };
const TONIGHT: Record<string, string> = {
  guide: "Tonight: read the moment you see most at home. 5 minutes.",
  program: "Tonight: watch Day 1 with your kid. 10 minutes.",
  upgrade: "Tonight: watch Day 1 with your kid. 10 minutes.",
  "screen-off-week": "Tonight: watch evening 1 with your kid before the screen goes off. 3 minutes.",
};

/** For one-time purchases. Needs the personal download links, so it's sent only once file delivery exists. */
export function orderReceipt(items: Item[], downloads: { name: string; url: string }[]): Email {
  const main = items.find((i) => ART[i.id]) ?? items[0];
  const blocks: Block[] = [
    { rows: items.map((i): [string, string] => [i.name, usd(i.price)]), total: ["Total", usd(total(items))] },
    { p: "Your files are ready. The links are personal, so please keep them to yourself." },
    ...downloads.map((d): Block => ({ button: { label: `Download ${d.name}`, url: d.url } })),
  ];
  if (main && TONIGHT[main.id]) blocks.push({ note: TONIGHT[main.id] });
  blocks.push({ p: "Creem, our payment partner, sends your official payment receipt in a separate email." });
  return renderEmail({
    subject: "Your Little Brain Crew order",
    preheader: "Your download links, and one small thing to try tonight.",
    kick: "thank you",
    title: "Your order is ready",
    art: main ? ART[main.id] : undefined,
    blocks,
    reason: "You’re getting this email because you bought from littlebraincrew.com.",
  });
}

/** Before every yearly renewal (the site promises it). Needs a daily job to send; not scheduled yet. */
export function renewalReminder(renewsOn: string): Email {
  return renderEmail({
    subject: `Your Crew Club renews on ${renewsOn}`,
    preheader: "Nothing to do if you want to stay. Here’s how to change or cancel.",
    kick: "a quick heads-up",
    title: "Your Crew Club renews soon",
    art: "teo",
    blocks: [
      { p: `Your yearly membership renews on ${renewsOn} for ${usd(ITEMS.clubYearly.price)}.` },
      { p: "If you want to keep it, there’s nothing to do." },
      { button: { label: "Manage my membership", url: "/account" } },
      { note: "Want to pause or cancel? Do it in your account, in 2 clicks, before that date and you won’t be charged." },
    ],
    reason: "You’re getting this email because you have a yearly Crew Club membership. We send it before every renewal.",
  });
}
