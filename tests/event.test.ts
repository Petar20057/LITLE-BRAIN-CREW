import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake } from "./fake-db";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fake.client() }));
vi.mock("@/lib/supabase/env", () => ({ supabaseConfigured: true }));

const { POST } = await import("@/app/api/event/route");
const { isBrowserEvent } = await import("@/lib/funnel-events");

const VISITOR = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const SESSION = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const PHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1";

let ip = 0;
function send(body: unknown, headers: Record<string, string> = {}) {
  return POST(
    new Request("https://www.littlebraincrew.com/api/event", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
      headers: { "user-agent": PHONE, "x-forwarded-for": `198.51.100.${++ip}`, ...headers },
    }) as NextRequest,
  );
}
const ok = (over: Record<string, unknown> = {}) => ({ name: "buy_click", visitor: VISITOR, session: SESSION, place: "hero", path: "/", ...over });

beforeEach(() => fake.reset());

describe("funnel events route", () => {
  it("keeps a browser step with its place and page", async () => {
    expect((await send(ok())).status).toBe(204);
    expect(fake.table("funnel_events")).toMatchObject([{ name: "buy_click", place: "hero", path: "/", visitor_id: VISITOR, session_id: SESSION }]);
  });

  it("accepts every browser step name", async () => {
    for (const name of ["buy_click", "checkout_view", "bump_checked", "email_signup", "moment_click"]) await send(ok({ name }));
    expect(fake.table("funnel_events").map((r) => r.name)).toEqual(["buy_click", "checkout_view", "bump_checked", "email_signup", "moment_click"]);
  });

  it("never takes the purchase events from the browser", async () => {
    await send(ok({ name: "purchase" }));
    await send(ok({ name: "post_bump_purchase" }));
    expect(fake.table("funnel_events")).toHaveLength(0);
    expect(isBrowserEvent("purchase")).toBe(false);
    expect(isBrowserEvent("post_bump_purchase")).toBe(false);
  });

  it("drops names that aren't on the list", async () => {
    await send(ok({ name: "drop_table" }));
    await send(ok({ name: "__proto__" }));
    expect(fake.table("funnel_events")).toHaveLength(0);
  });

  it("drops a visit id that isn't a session id", async () => {
    await send(ok({ visitor: "not-a-uuid" }));
    await send(ok({ session: 42 }));
    expect(fake.table("funnel_events")).toHaveLength(0);
  });

  it("skips bots and pages the site doesn't count", async () => {
    await send(ok(), { "user-agent": "Googlebot/2.1" });
    await send(ok({ path: "/admin/quiz" }));
    await send(ok({ path: "no-leading-slash" }));
    expect(fake.table("funnel_events")).toHaveLength(0);
  });

  it("keeps the place only when it is short and plain", async () => {
    await send(ok({ place: "<script>x</script>" }));
    expect(fake.table("funnel_events")[0].place).toBeNull();
  });

  it("answers 204 and stores nothing on a body that isn't JSON", async () => {
    expect((await send("{not json")).status).toBe(204);
    expect(fake.table("funnel_events")).toHaveLength(0);
  });
});
