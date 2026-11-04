import { describe, expect, it, vi } from "vitest";

// /personal-plan shows the form only once plan_requests exists (lib/personal-plan.ts planFormReady). A missing table must keep
// it closed: postgrest-js turns a HEAD 404 into a success, so the check has to be a GET that returns PostgREST's error.
vi.mock("@/lib/supabase/env", () => ({ supabaseConfigured: true }));
const limit = vi.fn(async () => ({ data: null, error: { code: "PGRST205", message: "Could not find the table 'public.plan_requests' in the schema cache" } }));
const select = vi.fn(() => ({ limit }));
vi.mock("@/lib/supabase/loose", () => ({ looseAdmin: () => ({ from: () => ({ select }) }) }));

const { planFormReady } = await import("@/lib/personal-plan");

describe("Personal plan form gate", () => {
  it("stays closed while plan_requests is missing, asks with a GET, and not again within a minute", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    expect(await planFormReady()).toBe(false);
    spy.mockRestore();
    expect(select).toHaveBeenCalledWith("id");
    expect(limit).toHaveBeenCalledWith(1);
    expect(await planFormReady()).toBe(false);
    expect(limit).toHaveBeenCalledOnce();
  });
});
