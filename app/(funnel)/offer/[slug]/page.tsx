import { notFound } from "next/navigation";
import OneTimeOffer from "@/components/funnel/OneTimeOffer";
import { OFFERS } from "@/lib/funnel";

// Every path is prerendered. Moving between funnel steps happens right after a payment call,
// so the step isn't expected to appear instantly; opt out of Next's instant-navigation check.
export const instant = false;

export function generateStaticParams() {
  return Object.keys(OFFERS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/offer/[slug]">) {
  const { slug } = await params;
  return { title: `${OFFERS[slug]?.title ?? "Offer"} · Little Brain Crew` };
}

export default async function Page({ params }: PageProps<"/offer/[slug]">) {
  const { slug } = await params;
  if (!(slug in OFFERS)) notFound();
  return <OneTimeOffer slug={slug} />;
}
