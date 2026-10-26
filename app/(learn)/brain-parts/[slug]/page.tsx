import { EntryRoute, entryMetadata, sectionStaticParams } from "@/lib/learn-routes";

export const instant = false;

export const generateStaticParams = () => sectionStaticParams("brain-parts");

export async function generateMetadata({ params }: PageProps<"/brain-parts/[slug]">) {
  const { slug } = await params;
  return entryMetadata("brain-parts", slug);
}

export default async function Page({ params }: PageProps<"/brain-parts/[slug]">) {
  const { slug } = await params;
  return <EntryRoute section="brain-parts" slug={slug} />;
}
