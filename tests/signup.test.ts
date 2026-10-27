import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake } from "./fake-db";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fake.client() }));
vi.mock("@/lib/supabase/env", () => ({ supabaseConfigured: true }));
vi.mock("@/lib/email/send", () => ({ sendEmail: vi.fn(async () => "message-id") }));

const { POST } = await import("@/app/api/signup/route");
const { POST: oneClick } = await import("@/app/api/unsubscribe/route");
const { sendEmail } = await import("@/lib/email/send");
const { confirmToken, unsubscribeToken } = await import("@/lib/consent");

let ip = 0;
function signup(body: Record<string, unknown>, from = `203.0.113.${++ip}`) {
  return POST(
    new Request("https://www.littlebraincrew.com/api/signup", {
      method: "POST",
      body: JSON.stringify({ page: "/free", ...body }),
      headers: { "content-type": "application/json", "x-forwarded-for": from },
    }) as NextRequest,
  );
}
const sent = () => vi.mocked(sendEmail).mock.calls;

beforeEach(() => {
  fake.reset();
  vi.mocked(sendEmail).mockClear();
});

describe("email forms (/api/signup)", () => {
  it("a newsletter signup waits for the emailed link before it counts", async () => {
    expect((await signup({ form: "free-screen-list", email: "Parent@Example.com" })).status).toBe(200);
    const row = fake.table("signups")[0];
    expect(row).toMatchObject({ email: "parent@example.com", confirmed_at: null });
    expect(sent()).toHaveLength(1);
    expect(sent()[0][1].html).toContain(`/confirm?t=${row.confirm_token}`);

    expect(await confirmToken(row.confirm_token)).toBe("done");
    expect(fake.table("signups")[0].confirmed_at).toBeTruthy();
  });

  it("signing up again the same day sends no second confirmation", async () => {
    await signup({ form: "free-screen-list", email: "parent@example.com" });
    await signup({ form: "free-screen-list", email: "parent@example.com" });
    expect(fake.table("signups")).toHaveLength(1);
    expect(sent()).toHaveLength(1);
  });

  it("an unconfirmed address asked again a day later gets the link again", async () => {
    await signup({ form: "screen-off-challenge", email: "parent@example.com" });
    fake.table("signups")[0].confirm_sent_at = new Date(Date.now() - 25 * 3600_000).toISOString();
    await signup({ form: "screen-off-challenge", email: "parent@example.com" });
    expect(sent()).toHaveLength(2);
  });

  it("waitlists and school inquiries have nothing to confirm and send no email", async () => {
    await signup({ form: "b2b", email: "teacher@school.example", details: { organization: "Oak School" } });
    expect(fake.table("signups")[0].confirmed_at).toBeTruthy();
    expect(sent()).toHaveLength(0);
  });

  it("refuses unknown forms, bad addresses and too many tries from one connection", async () => {
    expect((await signup({ form: "made-up", email: "parent@example.com" })).status).toBe(400);
    expect((await signup({ form: "free-screen-list", email: "nope" })).status).toBe(400);
    const statuses = [];
    for (let i = 0; i < 11; i++) statuses.push((await signup({ form: "shop-waitlist", email: `p${i}@example.com` }, "198.51.100.9")).status);
    expect(statuses.slice(0, 10).every((s) => s === 200)).toBe(true);
    expect(statuses[10]).toBe(429);
  });
});

describe("unsubscribe", () => {
  it("takes the address off every list, from the link in any of its emails", async () => {
    await signup({ form: "free-screen-list", email: "parent@example.com" });
    await signup({ form: "sticker-pack", email: "parent@example.com" });
    fake.seed("quiz_leads", { email: "parent@example.com", tips_consent: true });
    fake.seed("signups", { email: "other@example.com", form: "free-screen-list" });

    expect(await unsubscribeToken(fake.table("signups")[0].confirm_token)).toBe("done");
    const mine = [...fake.table("signups"), ...fake.table("quiz_leads")].filter((r) => r.email === "parent@example.com");
    expect(mine.every((r) => r.unsubscribed_at)).toBe(true);
    expect(fake.table("signups").find((r) => r.email === "other@example.com")?.unsubscribed_at).toBeNull();
    expect(await unsubscribeToken(fake.table("signups")[0].confirm_token)).toBe("already");
  });

  it("one-click unsubscribe from the mail app works by POST, and an unknown token is a 404", async () => {
    fake.seed("quiz_leads", { email: "parent@example.com", tips_consent: true });
    const token = fake.table("quiz_leads")[0].token;
    const post = (t: unknown) => oneClick(new NextRequest(`https://www.littlebraincrew.com/api/unsubscribe?t=${t}`, { method: "POST" }));
    expect((await post(token)).status).toBe(200);
    expect(fake.table("quiz_leads")[0].unsubscribed_at).toBeTruthy();
    expect((await post("3d4e5f6a-7b8c-4d9e-8f0a-1b2c3d4e5f6a")).status).toBe(404);
  });
});
