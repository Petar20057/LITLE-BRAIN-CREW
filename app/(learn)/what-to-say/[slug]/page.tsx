import { EntryRoute, entryMetadata, sectionStaticParams } from "@/lib/learn-routes";

export const instant = false;

export const generateStaticParams = () => sectionStaticParams("what-to-say");

export async function generateMetadata({ params }: PageProps<"/what-to-say/[slug]">) {
  const { slug } = await params;
  return entryMetadata("what-to-say", slug);
}

export default async function Page({ params }: PageProps<"/what-to-say/[slug]">) {
  const { slug } = await params;
  return <EntryRoute section="what-to-say" slug={slug} />;
}
