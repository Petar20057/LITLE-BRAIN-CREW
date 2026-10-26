import { EntryRoute, entryMetadata, sectionStaticParams } from "@/lib/learn-routes";

export const instant = false;

export const generateStaticParams = () => sectionStaticParams("why");

export async function generateMetadata({ params }: PageProps<"/why/[slug]">) {
  const { slug } = await params;
  return entryMetadata("why", slug);
}

export default async function Page({ params }: PageProps<"/why/[slug]">) {
  const { slug } = await params;
  return <EntryRoute section="why" slug={slug} />;
}
