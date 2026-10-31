import { describe, expect, it } from "vitest";
import { SAMPLES } from "@/lib/email/samples";
import { EMAIL_BASE, renderEmail, tag, tint } from "@/lib/email/layout";

// Every email in /dev/emails, checked for the things that decide whether it is delivered, opened and clicked.
const all = Object.entries(SAMPLES).map(([name, make]) => ({ name, email: make() }));
const hrefs = (html: string) => [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1].replaceAll("&amp;", "&"));
// Where a link is a token, a file or a legal page: never tagged (layout.ts UNTAGGED).
const UNTAGGED = /^\/(confirm|unsubscribe|api|downloads|privacy|terms)(\/|$)/;

describe("every email", () => {
  it.each(all)("$name: subject and preheader are written to be opened", ({ email }) => {
    // A phone shows about 40 characters of the subject; the inbox cuts the rest at 60 or so.
    expect(email.subject.length).toBeLessThanOrEqual(62);
    expect(email.preheader.length).toBeGreaterThanOrEqual(30);
    expect(email.preheader.length).toBeLessThanOrEqual(120);
    expect(email.preheader).not.toBe(email.subject);
    // Calm copy: shouting and exclamation marks are spam signals as much as they're off-brand.
    expect(email.subject).not.toMatch(/!|\b[A-Z]{4,}\b/);
  });

  it.each(all)("$name: stays well under Gmail's 102 KB clipping and has a text part", ({ email }) => {
    expect(Buffer.byteLength(email.html)).toBeLessThan(80_000);
    expect(email.text.length).toBeGreaterThan(100);
  });

  it.each(all)("$name: every image has alt text and every link stays on our own site", ({ email }) => {
    for (const img of email.html.match(/<img [^>]*>/g) ?? []) expect(img).toMatch(/ alt="/);
    for (const href of hrefs(email.html)) expect(href.startsWith(`${EMAIL_BASE}/`)).toBe(true);
  });

  it.each(all)("$name: at most one coral button, so there is one clear thing to click", ({ email }) => {
    expect(email.html.match(/background:#FF5A36/g)?.length ?? 0).toBeLessThanOrEqual(1);
  });

  it.each(all)("$name: links to the site carry UTM tags, tokens and files do not", ({ email }) => {
    for (const href of hrefs(email.html)) {
      const u = new URL(href);
      if (UNTAGGED.test(u.pathname)) {
        expect(u.searchParams.has("utm_source")).toBe(false);
      } else {
        expect(u.searchParams.get("utm_source")).toMatch(/^(email|reminder)$/);
        expect(u.searchParams.get("utm_campaign") ?? u.searchParams.get("utm_source")).toBeTruthy();
      }
    }
  });

  it.each(all)("$name: supports dark mode with the white logo", ({ email }) => {
    expect(email.html).toContain("prefers-color-scheme:dark");
    expect(email.html).toContain("/email/logo-white.png");
  });
});

describe("list emails", () => {
  const lists = all.filter(({ email }) => email.html.includes("/unsubscribe?t="));

  it("the free offers and the challenge all have an unsubscribe link and invite a reply", () => {
    expect(lists.map((l) => l.name)).toEqual(expect.arrayContaining(["free-screen-list", "free-sticker-pack", "challenge-day-1", "challenge-day-5"]));
    for (const { email } of lists) expect(email.html).toContain("Unsubscribe</a>");
    for (const name of ["free-screen-list", "free-sticker-pack", "challenge-day-1"]) {
      const { email } = all.find((a) => a.name === name)!;
      expect(email.text).toContain("hello@littlebraincrew.com");
      expect(email.text).toMatch(/reply/i);
    }
  });
});

describe("what each email is for", () => {
  const get = (name: string) => all.find((a) => a.name === name)!.email;

  it("the confirmation says what is waiting, per form, and its button says what happens", () => {
    expect(get("confirm-free-screen-list").subject).toContain("screen-time list");
    expect(get("confirm-sticker-pack").subject).toContain("stickers");
    expect(get("confirm-screen-off-challenge").subject).toContain("challenge");
    expect(get("confirm-free-screen-list").text).toContain("Confirm and get the list");
  });

  it("the quiz result names the crew in the subject and its offers carry the quiz tags", () => {
    const e = get("quiz-result");
    expect(e.subject).toMatch(/^Dopa, Greli and more: /);
    expect(e.text).toContain("utm_campaign=quiz-result");
    expect(e.text).toContain("/checkout/guide?crew=dopa&moment=screen-off");
  });

  it("the receipt names the product, and Day 5 offers the Toolkit on the screen-endings page", () => {
    expect(get("order-receipt").subject).toBe("The Kid Brain Toolkit: your download links");
    const day5 = get("challenge-day-5");
    expect(day5.text).toContain("/checkout/guide?crew=dopa&moment=screen-off&utm_source=email&utm_medium=lifecycle&utm_campaign=challenge-day-5");
    expect(day5.text).toContain("Start the 30-Day Reset");
  });

  it("the reminder subject doesn't say 'Your The …' and keeps its own utm_source", () => {
    const e = get("checkout-reminder");
    expect(e.subject).toBe("Pick up where you left off: The Kid Brain Toolkit");
    expect(e.text).toContain("utm_source=reminder");
    expect(e.text).not.toContain("utm_source=email&utm_medium=lifecycle&utm_campaign=checkout-reminder&utm_content=finish");
  });

  it("the challenge shows where you are in the five days", () => {
    expect(get("challenge-day-2").html).toContain("Day 2 of 5");
  });
});

describe("tag()", () => {
  it("tags our pages with the campaign and the button's label, and leaves the rest alone", () => {
    expect(tag("/checkout/guide?crew=dopa", "quiz-result", "Get the Toolkit · $9")).toBe(
      `${EMAIL_BASE}/checkout/guide?crew=dopa&utm_source=email&utm_medium=lifecycle&utm_campaign=quiz-result&utm_content=get-the-toolkit-9`,
    );
    expect(tag("/#plans", "x", "Plans")).toContain("utm_content=plans");
    expect(tag("/confirm?t=abc", "x", "Confirm")).toBe(`${EMAIL_BASE}/confirm?t=abc`);
    expect(tag("/api/download?t=a&f=b", "x", "File")).toBe(`${EMAIL_BASE}/api/download?t=a&f=b`);
    expect(tag("https://example.com/a", "x", "Other")).toBe("https://example.com/a");
    expect(tag("/checkout/guide?utm_source=reminder", "x", "Finish")).toBe(`${EMAIL_BASE}/checkout/guide?utm_source=reminder`);
    expect(tag("/free", undefined, "Join")).toBe(`${EMAIL_BASE}/free`);
  });

  it("tint() is the crew color at 30% on white", () => {
    expect(tint("#000000")).toBe("#B3B3B3");
    expect(tint("#FFFFFF")).toBe("#FFFFFF");
  });
});

describe("renderEmail", () => {
  it("falls back to the site's yellow for a crew key it doesn't know", () => {
    const e = renderEmail({ subject: "s", preheader: "p", title: "t", art: "nobody", blocks: [{ p: "x" }], reason: "r" });
    expect(e.html).toContain("#FFF5CC");
  });
});
