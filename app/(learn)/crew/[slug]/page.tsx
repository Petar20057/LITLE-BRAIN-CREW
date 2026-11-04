import { notFound } from "next/navigation";
import CharacterPage from "@/components/learn/CharacterPage";
import { isUnlocked } from "@/lib/character-rules";
import { UNLOCKED, characterAt, characterPath } from "@/lib/characters";
import { simpleMetadata } from "@/lib/seo";

// Every unlocked character has a page (an unpublished one is noindex and shows only "Tell me when ready"). A locked
// character has none: its card on /crew is a silhouette that leads to the Toolkit checkout, and its text is only in the
// Complete Crew Guide PDF. Like the other [slug] routes, the page may block on `params`.
export const instant = false;

export const generateStaticParams = () => UNLOCKED.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: PageProps<"/crew/[slug]">) {
  const { slug } = await params;
  const c = characterAt(slug);
  if (!c || !isUnlocked(c)) return {};
  return simpleMetadata({
    metaTitle: `${c.name}: ${c.real}`.slice(0, 60),
    description: c.sentence,
    path: characterPath(c),
    noindex: !c.published,
  });
}

export default async function Page({ params }: PageProps<"/crew/[slug]">) {
  const { slug } = await params;
  const c = characterAt(slug);
  if (!c || !isUnlocked(c)) notFound();
  return <CharacterPage c={c} />;
}
