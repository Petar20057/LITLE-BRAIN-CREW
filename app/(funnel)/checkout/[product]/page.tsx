import { notFound } from "next/navigation";
import Checkout from "@/components/funnel/Checkout";
import { PRODUCTS, type Product } from "@/lib/funnel";

const isProduct = (s: string): s is Product["slug"] => s in PRODUCTS;

// Every path is prerendered. Moving between funnel steps happens right after a payment call,
// so the step isn't expected to appear instantly; opt out of Next's instant-navigation check.
export const instant = false;

export function generateStaticParams() {
  return Object.keys(PRODUCTS).map((product) => ({ product }));
}

export async function generateMetadata({ params }: PageProps<"/checkout/[product]">) {
  const { product } = await params;
  return { title: isProduct(product) ? `Checkout: ${PRODUCTS[product].title} · Little Brain Crew` : "Checkout · Little Brain Crew" };
}

export default async function Page({ params }: PageProps<"/checkout/[product]">) {
  const { product } = await params;
  if (!isProduct(product)) notFound();
  return <Checkout slug={product} />;
}
