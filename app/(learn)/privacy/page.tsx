import SitePageView from "@/components/learn/SitePageView";
import { SITE_PAGES } from "@/content/learn";
import { simpleMetadata } from "@/lib/seo";

export const instant = false;

const page = SITE_PAGES.find((p) => p.slug === "privacy");

export const metadata = page
  ? simpleMetadata({ metaTitle: page.metaTitle, description: page.description, path: "/privacy" })
  : { robots: { index: false, follow: false } };

export default function Page() {
  return <SitePageView slug="privacy" />;
}
