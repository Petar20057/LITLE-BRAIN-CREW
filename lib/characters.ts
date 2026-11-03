import "server-only";

// All the characters the site knows: the 26 drawn in crew-art.js (from lib/learn.ts, always free) plus every row of
// content/characters.json (Luka's CSV, imported by scripts/import-characters.mjs). A CSV row with the same slug
// replaces the built-in one. Only server code may import this file: the JSON holds the locked text.
import data from "@/content/characters.json";
import { GLOSSARY, entryAt } from "@/content/learn";
import { CHARS, CREW_GROUPS, charPage, type CharGroup } from "@/lib/learn";
import { packsOf, publicOf, type Character, type PublicCharacter } from "./character-rules";

const GROUP_PACK: Record<CharGroup, string> = {
  chemical: "Brain chemicals", "brain-part": "Brain parts", rule: "The two rules", villain: "The villains", age: "Ages and stages",
};

function siteCrew(): Character[] {
  const glossaryNames = new Set(GLOSSARY.map((g) => g.char).filter(Boolean));
  return CREW_GROUPS.flatMap((g) =>
    g.keys.map((key) => {
      const c = CHARS[key];
      const page = charPage(key);
      const entry = page && entryAt(g.section, page.path.split("/").at(-1) ?? "");
      return {
        slug: key,
        name: c.name,
        real: c.real,
        group: GROUP_PACK[c.group],
        pack: "",
        packSlug: "",
        access: "free" as const,
        sample: false,
        inGlossary: glossaryNames.has(c.name),
        published: true,
        sentence: c.job.charAt(0).toUpperCase() + c.job.slice(1) + ".",
        shortAnswer: entry?.answer ?? "",
        whenToTalk: entry?.whenToTalk ?? "",
        color: c.color,
        artKey: key,
        locked: {},
      };
    }),
  );
}

const imported = data as Character[];
const builtIn = siteCrew().filter((c) => !imported.some((i) => i.slug === c.slug));

/** Every character, built-in crew first, then the CSV in its own order. */
export const CHARACTERS: readonly Character[] = [...builtIn, ...imported];
export const PUBLIC_CHARACTERS: readonly PublicCharacter[] = CHARACTERS.map(publicOf);
export const PACKS = packsOf(CHARACTERS);

export const characterAt = (slug: string): Character | undefined => CHARACTERS.find((c) => c.slug === slug);
export const packAt = (slug: string) => PACKS.find((p) => p.slug === slug);
export const characterPath = (c: Pick<Character, "slug">) => `/crew/${c.slug}`;
/** The character a glossary row points at, by the name in its `char` field. */
export const characterNamed = (name: string | undefined) => (name ? CHARACTERS.find((c) => c.name === name && c.inGlossary && c.published) : undefined);
