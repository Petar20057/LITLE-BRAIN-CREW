import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake } from "./fake-db";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fake.client() }));
vi.mock("@/lib/supabase/env", () => ({ supabaseConfigured: true }));
vi.mock("@/lib/email/send", () => ({ sendEmail: vi.fn(async () => "message-id") }));

const { POST } = await import("@/app/api/quiz/lead/route");
const { sendEmail } = await import("@/lib/email/send");
const { confirmToken } = await import("@/lib/consent");

const SID_A = "0a1b2c3d-4e5f-4a6b-8c7d-8e9f0a1b2c3d";
const SID_B = "1b2c3d4e-5f6a-4b7c-9d8e-9f0a1b2c3d4e";
const ANSWERS = { age: "6-7", moments: ["screens", "after-school"] };

let ip = 0;
function lead(body: Record<string, unknown>, from = `203.0.113.${++ip}`) {
  return POST(
    new Request("https://www.littlebraincrew.com/api/quiz/lead", {
      method: "POST",
      body: JSON.stringify({ ...ANSWERS, ...body }),
      headers: { "content-type": "application/json", "x-forwarded-for": from },
    }) as NextRequest,
  );
}
const sent = () => vi.mocked(sendEmail).mock.calls;

beforeEach(() => {
  fake.reset();
  vi.mocked(sendEmail).mockClear();
  fake.seed("quiz_sessions", { id: SID_A });
  fake.seed("quiz_sessions", { id: SID_B });
});

describe("/code email gate", () => {
  it("sends the result once for a quiz visit we saw", async () => {
    expect((await lead({ sid: SID_A, email: "Parent@Example.com" })).status).toBe(200);
    expect(sent()).toHaveLength(1);
    expect(sent()[0][0]).toBe("parent@example.com");
    expect(fake.table("quiz_leads")).toMatchObject([{ email: "parent@example.com", session_id: SID_A }]);
  });

  it("sends nothing for a made-up visit id (a script mailing strangers)", async () => {
    await lead({ sid: "2c3d4e5f-6a7b-4c8d-ae9f-0a1b2c3d4e5f", email: "stranger@example.com" });
    expect(sent()).toHaveLength(0);
  });

  it("asking twice on the same visit sends one email", async () => {
    await lead({ sid: SID_A, email: "parent@example.com" });
    await lead({ sid: SID_A, email: "parent@example.com" });
    await lead({ sid: SID_A, email: "someone-else@example.com" });
    expect(sent()).toHaveLength(1);
  });

  it("one result email per address a day, even from new visits", async () => {
    await lead({ sid: SID_A, email: "parent@example.com" });
    await lead({ sid: SID_B, email: "parent@example.com" });
    expect(sent()).toHaveLength(1);

    fake.table("quiz_leads")[0].result_emailed_at = new Date(Date.now() - 25 * 3600_000).toISOString();
    fake.table("quiz_sessions")[1].emailed_at = null;
    await lead({ sid: SID_B, email: "parent@example.com" });
    expect(sent()).toHaveLength(2);
  });

  it("ticking weekly tips only asks: confirmed by the link in the email", async () => {
    await lead({ sid: SID_A, email: "parent@example.com", consent: true });
    const row = fake.table("quiz_leads")[0];
    expect(row).toMatchObject({ tips_consent: false });
    expect(row.tips_requested_at).toBeTruthy();
    expect(sent()[0][1].html).toContain(`/confirm?t=${row.token}`);

    expect(await confirmToken(row.token)).toBe("done");
    expect(fake.table("quiz_leads")[0]).toMatchObject({ tips_consent: true });
    expect(await confirmToken(row.token)).toBe("already");
  });

  it("without the tick there is no confirm link and nothing to confirm", async () => {
    await lead({ sid: SID_A, email: "parent@example.com" });
    const row = fake.table("quiz_leads")[0];
    expect(sent()[0][1].html).not.toContain("/confirm?t=");
    expect(await confirmToken(row.token)).toBe("unknown");
  });

  it("refuses a bad address and too many tries from one connection", async () => {
    expect((await lead({ sid: SID_A, email: "not-an-email" })).status).toBe(400);
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await lead({ email: `p${i}@example.com` }, "198.51.100.7")).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
  });
});
