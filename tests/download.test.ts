import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake } from "./fake-db";

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => fake.client() }));
vi.mock("@/lib/supabase/env", () => ({ supabaseConfigured: true }));
// Storage isn't in the fake database: a signed link is just the path with a marker.
vi.mock("@/lib/delivery", async (original) => ({
  ...(await original<typeof import("@/lib/delivery")>()),
  signedFileUrl: vi.fn(async (path: string) => `https://storage.example/signed/${path}?expires=900`),
}));

const { GET } = await import("@/app/api/download/route");
const hash = (t: string) => createHash("sha256").update(t).digest("hex");

const get = (query: string) => GET(new NextRequest(`https://www.littlebraincrew.com/api/download?${query}`));

beforeEach(() => {
  fake.reset();
  fake.seed("orders", { provider_order_id: "chk_1", email: "mom@example.com", order_key: "guide", items: ["guide"], delivery_hash: hash("good-token") });
});

describe("download route", () => {
  it("sends a buyer of the Toolkit to a signed link for a Toolkit file", async () => {
    const res = await get("t=good-token&f=toolkit-pdf");
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://storage.example/signed/Kid-Brain-Toolkit/The-Kid-Brain-Toolkit.pdf?expires=900");
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });

  it("does not open the Bedtime Kit for a Toolkit-only order", async () => {
    expect((await get("t=good-token&f=bedtime-pdf")).status).toBe(403);
  });

  it("refuses a token that matches no order", async () => {
    expect((await get("t=wrong&f=toolkit-pdf")).status).toBe(404);
    expect((await get("f=toolkit-pdf")).status).toBe(404);
  });

  it("refuses a file id that doesn't exist", async () => {
    expect((await get("t=good-token&f=../../secret")).status).toBe(404);
  });

  it("refuses an expired link", async () => {
    fake.table("orders")[0].download_until = "2020-01-01T00:00:00Z";
    expect((await get("t=good-token&f=toolkit-pdf")).status).toBe(410);
  });
});
