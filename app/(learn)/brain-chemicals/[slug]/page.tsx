import { EntryRoute, entryMetadata, sectionStaticParams } from "@/lib/learn-routes";

export const instant = false;

export const generateStaticParams = () => sectionStaticParams("brain-chemicals");

export async function generateMetadata({ params }: PageProps<"/brain-chemicals/[slug]">) {
  const { slug } = await params;
  return entryMetadata("brain-chemicals", slug);
}

export default async function Page({ params }: PageProps<"/brain-chemicals/[slug]">) {
  const { slug } = await params;
  return <EntryRoute section="brain-chemicals" slug={slug} />;
}
