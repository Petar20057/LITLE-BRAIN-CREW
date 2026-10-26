import { notFound } from "next/navigation";
import DesignPage from "@/components/DesignPage";
import { PAGES, pageMetadata, type PageName } from "@/lib/design";

// Every design/<name>.html except index is served at /<name>.
const isPage = (slug: string): slug is PageName => slug !== "index" && slug in PAGES;

// Every path is prerendered and reached by a full page load (plain links), so there is no
// client-side navigation for Next's instant-navigation check to validate.
export const instant = false;

export function generateStaticParams() {
  return Object.keys(PAGES).filter(isPage).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  return isPage(slug) ? pageMetadata(slug) : {};
}

export default async function Page({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  if (!isPage(slug)) notFound();
  return <DesignPage name={slug} />;
}
