import { describe, expect, it } from "vitest";
import { canRead, countsOf, packsOf, paragraphs, publicOf, slugify, validate, type Character } from "@/lib/character-rules";
import { accessOf, mapHeaders, parseCsv, rowToCharacter, yes } from "../scripts/import-characters.mjs";

const base: Character = {
  slug: "soli", name: "Soli", real: "Vitamin D", pack: "Fuel & Body Pack", packSlug: "fuel-body-pack",
  access: "locked", sample: false, inGlossary: true, published: true,
  sentence: "The sunshine helper.", shortAnswer: "Short.", whenToTalk: "If…",
  locked: { explanation: "SECRET explanation", whatToSay: "SECRET words", print: "https://example.com/p.pdf", cartoon: "https://example.com/c" },
};
const free: Character = { ...base, slug: "dopa", name: "Dopa", access: "free", pack: "", packSlug: "", sample: false };

describe("who may read a character", () => {
  it("free pages are open to everyone", () => {
    expect(canRead(free, { club: false, packs: [] })).toBe(true);
  });
  it("locked pages need the Club or the character's own pack", () => {
    expect(canRead(base, { club: false, packs: [] })).toBe(false);
    expect(canRead(base, { club: true, packs: [] })).toBe(true);
    expect(canRead(base, { club: false, packs: ["fuel-body-pack"] })).toBe(true);
    expect(canRead(base, { club: false, packs: ["puberty-pack"] })).toBe(false);
  });
  it("nothing is readable before it is published, even for members", () => {
    expect(canRead({ ...base, published: false }, { club: true, packs: ["fuel-body-pack"] })).toBe(false);
    expect(canRead({ ...free, published: false }, { club: true, packs: [] })).toBe(false);
  });
  it("the public view has no locked text at all", () => {
    const pub = publicOf(base);
    expect(JSON.stringify(pub)).not.toContain("SECRET");
    expect(pub).not.toHaveProperty("locked");
    expect(pub.shortAnswer).toBe("Short.");
    expect(pub.whenToTalk).toBe("If…");
  });
});

describe("packs", () => {
  const chars: Character[] = [
    free,
    { ...base, slug: "a", name: "A", sample: true, access: "free" },
    { ...base, slug: "b", name: "B" },
    { ...base, slug: "c", name: "C", published: false },
    { ...base, slug: "p1", name: "P1", pack: "Puberty Pack", packSlug: "puberty-pack", sample: true, access: "free" },
    { ...base, slug: "p2", name: "P2", pack: "Puberty Pack", packSlug: "puberty-pack" },
  ];
  it("go on sale only when every character is ready, and keep CSV order", () => {
    const packs = packsOf(chars);
    expect(packs.map((p) => p.slug)).toEqual(["fuel-body-pack", "puberty-pack"]);
    expect(packs[0]).toMatchObject({ total: 3, ready: 2, onSale: false, samples: ["a"] });
    expect(packs[1]).toMatchObject({ total: 2, ready: 2, onSale: true, samples: ["p1"] });
  });
  it("count free and locked for the filters", () => {
    expect(countsOf(chars)).toEqual({ all: 6, free: 3, locked: 3 });
  });
  it("validation catches the rules from the brief", () => {
    expect(validate(chars)).toEqual([]);
    const bad: Character[] = [
      { ...base, slug: "x", name: "X", sample: true },
      { ...base, slug: "x", name: "X2", access: "nope" as Character["access"], sample: true },
      { ...base, slug: "y", name: "Y", pack: "", packSlug: "" },
      { ...base, slug: "z", name: "Z", shortAnswer: "", whenToTalk: "" },
    ];
    const problems = validate(bad);
    expect(problems).toContain("X (x): a sample must be free");
    expect(problems).toContain("X2 (x): duplicate slug");
    expect(problems.some((p) => p.includes("access must be free or locked"))).toBe(true);
    expect(problems).toContain("Y (y): locked but in no pack");
    expect(problems).toContain("Z (z): published but no short answer");
    expect(problems).toContain('Z (z): published but no "When to talk to your pediatrician"');
    expect(problems).toContain("pack Fuel & Body Pack: 2 samples, expected exactly one");
  });
});

describe("text helpers", () => {
  it("slugs are ASCII", () => {
    expect(slugify("Fuel & Body Pack")).toBe("fuel-body-pack");
    expect(slugify("Đurđa Čić")).toBe("djurdja-cic");
    expect(slugify("  Vitamin D  ")).toBe("vitamin-d");
  });
  it("paragraphs split on line breaks", () => {
    expect(paragraphs("One.\n\nTwo.\nThree.")).toEqual(["One.", "Two.", "Three."]);
    expect(paragraphs(undefined)).toEqual([]);
  });
});

describe("CSV import", () => {
  const csv = [
    'Ime,Naučni naziv,Paket,Pristup,Probni,U rečniku,Objavljen,Rečenica,Kratak odgovor,Pedijatar,Objašnjenje,Šta reći,Štampa,Crtani,Napomena',
    'Soli,Vitamin D,Fuel & Body Pack,locked,no,yes,da,"The sunshine helper, really.",Short.,"If…","Line one.\n\nLine two.",Say this.,https://x/p.pdf,,ignored',
    'Zinki,Zinc,Fuel & Body Pack,free,yes,ne,ne,Growth helper.,,,,,,,',
  ].join("\n");
  it("reads quoted commas and line breaks and maps Serbian headers", () => {
    const [headers, ...rows] = parseCsv(csv);
    expect(rows).toHaveLength(2);
    const { map, unknown } = mapHeaders(headers);
    expect(unknown).toEqual(["Napomena"]);
    const soli = rowToCharacter(rows[0], map);
    expect(soli).toMatchObject({
      slug: "soli", name: "Soli", real: "Vitamin D", pack: "Fuel & Body Pack", packSlug: "fuel-body-pack",
      access: "locked", sample: false, inGlossary: true, published: true, sentence: "The sunshine helper, really.",
      shortAnswer: "Short.", whenToTalk: "If…",
      locked: { explanation: "Line one.\n\nLine two.", whatToSay: "Say this.", print: "https://x/p.pdf" },
    });
    expect(soli.locked).not.toHaveProperty("cartoon");
    const zinki = rowToCharacter(rows[1], map);
    expect(zinki).toMatchObject({ slug: "zinki", access: "free", sample: true, inGlossary: false, published: false, locked: {} });
  });
  it("understands yes/no in both languages", () => {
    expect(yes("da")).toBe(true);
    expect(yes("Yes")).toBe(true);
    expect(yes("ne")).toBe(false);
    expect(yes("")).toBe(false);
    expect(accessOf("Slobodno")).toBe("free");
    expect(accessOf("Zaključano")).toBe("locked");
    expect(accessOf("maybe")).toBe("maybe");
  });
});
