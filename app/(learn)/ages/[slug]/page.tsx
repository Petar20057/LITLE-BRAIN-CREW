import { EntryRoute, entryMetadata, sectionStaticParams } from "@/lib/learn-routes";

export const instant = false;

export const generateStaticParams = () => sectionStaticParams("ages");

export async function generateMetadata({ params }: PageProps<"/ages/[slug]">) {
  const { slug } = await params;
  return entryMetadata("ages", slug);
}

export default async function Page({ params }: PageProps<"/ages/[slug]">) {
  const { slug } = await params;
  return <EntryRoute section="ages" slug={slug} />;
}
