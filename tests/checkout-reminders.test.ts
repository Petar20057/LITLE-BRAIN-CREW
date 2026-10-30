import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake } from "./fake-db";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fake.client() }));
vi.mock("@/lib/email/send", () => ({ sendEmail: vi.fn(async () => "message-id") }));

const { recordCheckoutStart, sendCheckoutReminders } = await import("@/lib/checkout-reminders");
const { unsubscribeToken } = await import("@/lib/consent");
const { sendEmail } = await import("@/lib/email/send");

const NOW = Date.parse("2026-11-02T16:00:00Z");
const hoursAgo = (h: number) => new Date(NOW - h * 3600_000).toISOString();

beforeEach(() => {
  fake.reset();
  vi.mocked(sendEmail).mockClear();
});

describe("abandoned checkout reminder", () => {
  it("saves a start with a lowercased email and only a known moment", async () => {
    await recordCheckoutStart({ email: " Mom@Example.com ", orderKey: "guide", crew: "dopa", moment: "screen-off" });
    await recordCheckoutStart({ email: "dad@example.com", orderKey: "guide", moment: "made-up" });
    await recordCheckoutStart({ email: "dad@example.com", orderKey: "upgrade" });
    expect(fake.table("checkout_starts")).toMatchObject([
      { email: "mom@example.com", order_key: "guide", crew: "dopa", moment: "screen-off" },
      { email: "dad@example.com", moment: null },
    ]);
  });

  it("sends one reminder 2 to 48 hours later, back to the same checkout and moment", async () => {
    fake.seed("checkout_starts", { email: "mom@example.com", order_key: "guide+bedtime-kit", crew: "dopa", moment: "screen-off", created_at: hoursAgo(3) });
    expect(await sendCheckoutReminders(NOW)).toEqual({ sent: 1, skipped: 0 });
    const [to, email, opts] = vi.mocked(sendEmail).mock.calls[0] as unknown as [string, { text: string }, { unsubscribeUrl: string }];
    expect(to).toBe("mom@example.com");
    expect(email.text).toContain("/checkout/guide?utm_source=reminder&crew=dopa&moment=screen-off");
    expect(email.text).toContain("page 36");
    expect(opts.unsubscribeUrl).toContain("/api/unsubscribe?t=");
    // Never twice.
    expect(await sendCheckoutReminders(NOW + 3600_000)).toEqual({ sent: 0, skipped: 0 });
  });

  it("waits 2 hours and gives up after 48", async () => {
    fake.seed("checkout_starts", { email: "a@example.com", order_key: "guide", created_at: hoursAgo(1) });
    fake.seed("checkout_starts", { email: "b@example.com", order_key: "guide", created_at: hoursAgo(50) });
    expect(await sendCheckoutReminders(NOW)).toEqual({ sent: 0, skipped: 0 });
  });

  it("skips anyone who paid since, or unsubscribed from anything", async () => {
    fake.seed("checkout_starts", { email: "paid@example.com", order_key: "guide", created_at: hoursAgo(5) });
    fake.seed("orders", { email: "paid@example.com", provider_order_id: "o1", created_at: hoursAgo(4) });
    fake.seed("checkout_starts", { email: "out@example.com", order_key: "program", created_at: hoursAgo(5) });
    fake.seed("signups", { email: "out@example.com", form: "free-screen-list", unsubscribed_at: hoursAgo(100) });
    expect(await sendCheckoutReminders(NOW)).toEqual({ sent: 0, skipped: 2 });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("reminds an address once, about its newest checkout", async () => {
    fake.seed("checkout_starts", { email: "mom@example.com", order_key: "guide", created_at: hoursAgo(10) });
    fake.seed("checkout_starts", { email: "mom@example.com", order_key: "program", created_at: hoursAgo(4) });
    expect(await sendCheckoutReminders(NOW)).toEqual({ sent: 1, skipped: 1 });
    expect((vi.mocked(sendEmail).mock.calls[0][1] as { text: string }).text).toContain("/checkout/program");
  });

  it("the reminder's token unsubscribes the address from everything", async () => {
    fake.seed("checkout_starts", { email: "mom@example.com", order_key: "guide", token: "11111111-1111-4111-8111-111111111111" });
    fake.seed("signups", { email: "mom@example.com", form: "free-screen-list" });
    expect(await unsubscribeToken("11111111-1111-4111-8111-111111111111")).toBe("done");
    expect(fake.table("checkout_starts")[0].unsubscribed_at).toBeTruthy();
    expect(fake.table("signups")[0].unsubscribed_at).toBeTruthy();
  });
});
