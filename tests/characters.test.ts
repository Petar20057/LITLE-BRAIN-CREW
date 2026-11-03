import { describe, expect, it } from "vitest";
import { ageLabel, packLabel, canRead, countsOf, groupTitle, packsOf, paragraphs, publicOf, slugify, sortByWave, validate, warnings, type Character } from "@/lib/character-rules";
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
    expect(problems).toContain("pack Fuel & Body Pack: 2 samples, expected one");
  });
  it("a built-in character may be published without CSV text (the site has it)", () => {
    const dopa: Character = { ...free, shortAnswer: "", whenToTalk: "" };
    expect(validate([dopa]).length).toBe(2);
    expect(validate([dopa], new Set(["dopa"]))).toEqual([]);
  });
  it("a pack without a marked sample is a warning, not a problem", () => {
    const noSample: Character[] = [base, { ...base, slug: "b", name: "B" }];
    expect(validate(noSample)).toEqual([]);
    expect(warnings(noSample)).toEqual(["pack Fuel & Body Pack: no free sample marked"]);
  });
  it("orders ★ before ○ before · and keeps the CSV order inside a wave", () => {
    const rows = [{ wave: "·", n: 1 }, { wave: "○", n: 2 }, { wave: "★", n: 3 }, { wave: "○", n: 4 }, { wave: undefined, n: 5 }];
    expect(sortByWave(rows).map((r) => r.n)).toEqual([3, 2, 4, 1, 5]);
  });
  it("names groups and ages for the page", () => {
    expect(groupTitle("habit_helpers")).toBe("Habit helpers");
    expect(groupTitle("something_new")).toBe("something_new");
    expect(groupTitle(undefined)).toBe("The crew");
    expect(ageLabel("13+")).toBe("Teens 13+");
    expect(ageLabel("10+")).toBe("Ages 10+");
    expect(ageLabel(undefined)).toBeUndefined();
    expect(packLabel("Fuel & Body")).toBe("Fuel & Body pack");
    expect(packLabel("Habit Helpers Pack")).toBe("Habit Helpers Pack");
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
  it("reads Luka's real column names", () => {
    const real = [
      "num,id,name,science_name,group,access,pack,wave,age_flag,has_page_now,teaser_en",
      "F10,teo,Teo,Testosterone,messengers,free,,,13+,yes,\"Builds strength, energy and confidence in the teen years.\"",
      "106,fero,Fero,Iron,food,locked,Fuel & Body,★,,no,Carries oxygen. Low iron can mean low energy.",
    ].join("\n");
    const [headers, ...rows] = parseCsv(real);
    const { map, unknown } = mapHeaders(headers);
    expect(unknown).toEqual([]);
    expect(rowToCharacter(rows[0], map)).toMatchObject({ slug: "teo", real: "Testosterone", group: "messengers", access: "free", pack: "", published: true, ageFlag: "13+", num: "F10", sentence: "Builds strength, energy and confidence in the teen years." });
    expect(rowToCharacter(rows[1], map)).toMatchObject({ slug: "fero", pack: "Fuel & Body", packSlug: "fuel-body", access: "locked", published: false, wave: "★", num: "106" });
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
