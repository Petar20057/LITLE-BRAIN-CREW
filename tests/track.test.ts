import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake } from "./fake-db";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fake.client() }));
vi.mock("@/lib/supabase/env", () => ({ supabaseConfigured: true }));

const { POST } = await import("@/app/api/track/route");
const { inAppBrowser } = await import("@/lib/analytics");

const VISITOR = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";
const SESSION = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d";
const VIEW = "1b2c3d4e-5f60-4a7b-9c8d-0e1f2a3b4c5d";
const PHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1";
const INSTAGRAM = `${PHONE} Instagram 352.0.0.0 (iPhone15,3; iOS 18_0; en_US)`;

let ip = 0;
function send(body: unknown, ua = PHONE) {
  return POST(
    new Request("https://www.littlebraincrew.com/api/track", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "user-agent": ua, "x-forwarded-for": `203.0.113.${++ip}` },
    }) as NextRequest,
  );
}
const view = (over: Record<string, unknown> = {}) => ({ visitor: VISITOR, session: SESSION, view: VIEW, path: "/", ...over });

beforeEach(() => fake.reset());

describe("page view route", () => {
  it("keeps the video tag, the view id and the app the page opened in", async () => {
    expect((await send(view({ utm_source: "TikTok", utm_content: "Dan-07-Dopa" }), INSTAGRAM)).status).toBe(204);
    expect(fake.table("page_views")).toMatchObject([
      { visitor_id: VISITOR, session_id: SESSION, view_id: VIEW, path: "/", utm_source: "tiktok", utm_content: "dan-07-dopa", app: "instagram", device: "mobile" },
    ]);
  });

  it("a plain browser has no app, and a bad view id is dropped, not the visit", async () => {
    await send(view({ view: "nope" }));
    expect(fake.table("page_views")).toMatchObject([{ app: null, view_id: null, utm_content: null }]);
  });

  it("the leave beacon fills in time on page and scroll for that view only", async () => {
    await send(view());
    await send(view({ view: "2b2c3d4e-5f60-4a7b-9c8d-0e1f2a3b4c5d" }));
    await send({ kind: "leave", session: SESSION, view: VIEW, seconds: 47.4, scroll: 82 });
    const [first, second] = fake.table("page_views");
    expect(first).toMatchObject({ seconds: 47, max_scroll: 82 });
    expect(second).toMatchObject({ seconds: null, max_scroll: null });
    expect(fake.table("page_views")).toHaveLength(2);
  });

  it("caps time and scroll, and ignores a leave beacon from another visit", async () => {
    await send(view());
    await send({ kind: "leave", session: "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4e", view: VIEW, seconds: 50, scroll: 50 });
    expect(fake.table("page_views")[0]).toMatchObject({ seconds: null });
    await send({ kind: "leave", session: SESSION, view: VIEW, seconds: 99999, scroll: 400 });
    expect(fake.table("page_views")[0]).toMatchObject({ seconds: 3600, max_scroll: 100 });
  });

  it("tells the social apps apart from their user agents", () => {
    expect(inAppBrowser(INSTAGRAM)).toBe("instagram");
    expect(inAppBrowser(`${PHONE} musical_ly_37.5.0 JsSdk/2.0 BytedanceWebview/d8a21c6`)).toBe("tiktok");
    expect(inAppBrowser(`${PHONE} [FBAN/FBIOS;FBAV/480.0.0.0]`)).toBe("facebook");
    expect(inAppBrowser(PHONE)).toBeNull();
  });
});
