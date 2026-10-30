import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { confidence } from "@/lib/admin";
import { EXPERIMENTS, abCss, abHeadScript, isExperiment } from "@/lib/experiments";

vi.mock("@/lib/supabase/server", () => ({}));

/** Runs the <head> script with a fake browser and returns the <html> attributes it set and what it stored. */
function runHead(script: string, { stored = {}, search = "", random = 0.1 }: { stored?: Record<string, string>; search?: string; random?: number } = {}) {
  const store = new Map(Object.entries({ "lbc-ab": JSON.stringify(stored) }));
  const attrs: Record<string, string> = {};
  const localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) };
  const document = { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } };
  const math = Object.create(Math, { random: { value: () => random } });
  new Function("localStorage", "document", "location", "Math", script)(localStorage, document, { search }, math);
  return { attrs, stored: JSON.parse(store.get("lbc-ab") ?? "{}") };
}

const ON = { ...EXPERIMENTS["home-hero"], active: true };

describe("A/B tests", () => {
  it("every data-ab spot in the design pages is a known test, with an A version", () => {
    for (const file of readdirSync("design").filter((f) => f.endsWith(".html"))) {
      const html = readFileSync(`design/${file}`, "utf8");
      for (const m of html.matchAll(/data-ab="([^"]+)"(?: data-v="([^"]+)")?/g)) {
        expect(isExperiment(m[1]), `${file}: ${m[1]}`).toBe(true);
        expect(m[2], `${file}: ${m[1]} needs data-v`).toMatch(/^[ab]$/);
      }
    }
  });

  it("an inactive test shows only A and adds no script", () => {
    expect(abCss()).toContain('[data-ab="home-hero"]:not([data-v="a"]){display:none!important}');
    if (!Object.values(EXPERIMENTS).some((e) => e.active)) expect(abHeadScript()).toBe("");
  });

  it("an active test gives a weighted version, keeps it, and honours ?ab=", () => {
    const original = EXPERIMENTS["home-hero"];
    Object.assign(EXPERIMENTS, { "home-hero": ON });
    try {
      const script = abHeadScript();
      expect(runHead(script, { random: 0.1 }).attrs).toMatchObject({ "data-ab-home-hero": "a" });
      expect(runHead(script, { random: 0.9 }).attrs).toMatchObject({ "data-ab-home-hero": "b" });
      // Sticky: a stored version wins over the dice.
      expect(runHead(script, { stored: { "home-hero": "b" }, random: 0.1 }).attrs["data-ab-home-hero"]).toBe("b");
      // QA override wins and is remembered; an unknown version is ignored.
      const forced = runHead(script, { stored: { "home-hero": "a" }, search: "?ab=home-hero:b" });
      expect(forced.attrs["data-ab-home-hero"]).toBe("b");
      expect(forced.stored["home-hero"]).toBe("b");
      expect(runHead(script, { stored: { "home-hero": "a" }, search: "?ab=home-hero:z" }).attrs["data-ab-home-hero"]).toBe("a");
      expect(abCss()).toContain('html[data-ab-home-hero="b"] [data-ab="home-hero"]:not([data-v="b"]){display:none!important}');
    } finally {
      Object.assign(EXPERIMENTS, { "home-hero": original });
    }
  });

  it("confidence: equal rates are chance, a big gap on many visitors is real", () => {
    expect(confidence(10, 500, 10, 500)).toBeCloseTo(0, 5);
    expect(confidence(10, 1000, 40, 1000)!).toBeGreaterThan(0.99);
    expect(confidence(3, 40, 5, 40)!).toBeLessThan(0.8);
    expect(confidence(0, 0, 1, 10)).toBeNull();
  });
});
