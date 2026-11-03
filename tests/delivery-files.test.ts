import { describe, expect, it } from "vitest";
import { DELIVERY_FILES, sectionsFor } from "@/lib/delivery-files";

// What each catalogue hands a buyer. The 4 crew cartoons left the Toolkit on 2026-11-03: catalogue v2 has none, catalogue v1
// (immutable: those buyers were promised them) keeps them. The Personal plan has no files at all.
const ids = (items: string[], version: 1 | 2) => sectionsFor(items, version).flatMap((s) => s.files.map((f) => f.id));
const kinds = (items: string[], version: 1 | 2) => sectionsFor(items, version).flatMap((s) => s.files.map((f) => f.kind));

describe("delivery catalogue", () => {
  it("a new Toolkit buyer gets the guide, the three printable bonuses and the zip, and no videos", () => {
    const files = ids(["guide"], 2);
    expect(files).toEqual(expect.arrayContaining(["toolkit-pdf", "script-cards-pdf", "meltdown-plan-pdf", "poster-pdf", "toolkit-zip"]));
    expect(kinds(["guide"], 2)).not.toContain("video");
    expect(files.some((id) => id.startsWith("cartoon-"))).toBe(false);
  });

  it("a legacy Toolkit buyer keeps the four cartoons", () => {
    expect(ids(["guide"], 1).filter((id) => id.startsWith("cartoon-"))).toHaveLength(4);
    expect(kinds(["guide"], 1).filter((k) => k === "video")).toHaveLength(4);
  });

  it("the Reset never included the cartoons", () => {
    expect(kinds(["program"], 2)).not.toContain("video");
    expect(kinds(["program"], 1)).toContain("video"); // v1 Reset came with the whole v1 Toolkit, cartoons included
  });

  it("a Personal plan has nothing to download", () => {
    expect(sectionsFor(["personal-plan"], 2)).toEqual([]);
    expect(sectionsFor(["personal-plan"], 1)).toEqual([]);
  });

  it("the cartoon files still exist for the legacy links", () => {
    expect(DELIVERY_FILES.filter((f) => f.id.startsWith("cartoon-")).map((f) => f.path)).toEqual(expect.arrayContaining([expect.stringContaining("Crew-Cartoons/")]));
  });
});
