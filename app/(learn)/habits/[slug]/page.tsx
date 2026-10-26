import { EntryRoute, entryMetadata, sectionStaticParams } from "@/lib/learn-routes";

export const instant = false;

export const generateStaticParams = () => sectionStaticParams("habits");

export async function generateMetadata({ params }: PageProps<"/habits/[slug]">) {
  const { slug } = await params;
  return entryMetadata("habits", slug);
}

export default async function Page({ params }: PageProps<"/habits/[slug]">) {
  const { slug } = await params;
  return <EntryRoute section="habits" slug={slug} />;
}
