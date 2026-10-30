import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake } from "./fake-db";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fake.client() }));
vi.mock("@/lib/email/send", () => ({ sendEmail: vi.fn(async () => "message-id") }));

const { confirmToken, unsubscribeToken } = await import("@/lib/consent");
const { sendChallengeEmails } = await import("@/lib/free-offers");
const { sendEmail } = await import("@/lib/email/send");

type Sent = [string, { subject: string; html: string; text: string }, { unsubscribeUrl?: string }];
const sent = () => vi.mocked(sendEmail).mock.calls as unknown as Sent[];
const HOUR = 3600_000;

beforeEach(() => {
  fake.reset();
  vi.mocked(sendEmail).mockClear();
});

function seed(form: string) {
  fake.seed("signups", { email: "parent@example.com", form });
  return fake.table("signups").at(-1)!;
}

describe("free offers on /free", () => {
  it("confirming the list sends the PDF link, with one-click unsubscribe", async () => {
    const row = seed("free-screen-list");
    expect(await confirmToken(row.confirm_token)).toBe("done");
    expect(sent()).toHaveLength(1);
    const [to, email, opts] = sent()[0];
    expect(to).toBe("parent@example.com");
    expect(email.text).toContain("/downloads/15-ways-to-end-screen-time.pdf");
    expect(email.text).toContain(`/unsubscribe?t=${row.confirm_token}`);
    expect(opts.unsubscribeUrl).toContain(`/api/unsubscribe?t=${row.confirm_token}`);
  });

  it("confirming the stickers sends the zip link", async () => {
    const row = seed("sticker-pack");
    await confirmToken(row.confirm_token);
    expect(sent()[0][1].text).toContain("/downloads/crew-stickers.zip");
  });

  it("confirming twice sends nothing the second time", async () => {
    const row = seed("free-screen-list");
    await confirmToken(row.confirm_token);
    expect(await confirmToken(row.confirm_token)).toBe("already");
    expect(sent()).toHaveLength(1);
  });

  it("the challenge sends Day 1 on confirm, then one day at a time until Day 5", async () => {
    const row = seed("screen-off-challenge");
    const start = Date.now();
    await confirmToken(row.confirm_token);
    expect(sent()[0][1].subject).toContain("Day 1 of 5");
    expect(fake.table("signups")[0].challenge_day).toBe(1);

    // Not yet: the same day.
    expect(await sendChallengeEmails(start + 2 * HOUR)).toEqual({ sent: 0 });
    for (let day = 2; day <= 5; day++) {
      expect(await sendChallengeEmails(start + (day - 1) * 24 * HOUR)).toEqual({ sent: 1 });
      expect(sent().at(-1)![1].subject).toContain(`Day ${day} of 5`);
    }
    // Done after Day 5.
    expect(await sendChallengeEmails(start + 10 * 24 * HOUR)).toEqual({ sent: 0 });
    expect(sent()).toHaveLength(5);
  });

  it("an unconfirmed or unsubscribed challenge gets nothing more", async () => {
    seed("screen-off-challenge");
    const row = seed("screen-off-challenge");
    row.email = "other@example.com";
    await confirmToken(row.confirm_token);
    expect(await unsubscribeToken(row.confirm_token)).toBe("done");
    expect(await sendChallengeEmails(Date.now() + 2 * 24 * HOUR)).toEqual({ sent: 0 });
    expect(sent()).toHaveLength(1);
  });
});
