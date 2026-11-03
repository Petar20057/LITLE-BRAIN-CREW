import { notFound } from "next/navigation";
import CharacterPage from "@/components/learn/CharacterPage";
import { CHARACTERS, characterAt, characterPath } from "@/lib/characters";
import { simpleMetadata } from "@/lib/seo";

// Every character has a page, published or not (an unpublished one is noindex and shows only "Tell me when ready").
// Like the other [slug] routes: the page may block on `params`; the locked part streams inside its own <Suspense>.
export const instant = false;

export const generateStaticParams = () => CHARACTERS.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: PageProps<"/crew/[slug]">) {
  const { slug } = await params;
  const c = characterAt(slug);
  if (!c) return {};
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
  if (!c) notFound();
  return <CharacterPage c={c} />;
}
