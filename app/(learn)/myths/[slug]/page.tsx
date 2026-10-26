import { EntryRoute, entryMetadata, sectionStaticParams } from "@/lib/learn-routes";

export const instant = false;

export const generateStaticParams = () => sectionStaticParams("myths");

export async function generateMetadata({ params }: PageProps<"/myths/[slug]">) {
  const { slug } = await params;
  return entryMetadata("myths", slug);
}

export default async function Page({ params }: PageProps<"/myths/[slug]">) {
  const { slug } = await params;
  return <EntryRoute section="myths" slug={slug} />;
}
