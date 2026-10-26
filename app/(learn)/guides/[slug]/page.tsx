import { EntryRoute, entryMetadata, sectionStaticParams } from "@/lib/learn-routes";

export const instant = false;

export const generateStaticParams = () => sectionStaticParams("guides");

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  return entryMetadata("guides", slug);
}

export default async function Page({ params }: PageProps<"/guides/[slug]">) {
  const { slug } = await params;
  return <EntryRoute section="guides" slug={slug} />;
}
