import { ENTRIES } from "@/content/learn";
import { renderEntryOg } from "@/lib/og";

// One OG card per entry at /og/<section>/<slug> (1200x630 PNG). Stable URLs, so metadata and JSON-LD can point at them.
export function generateStaticParams() {
  return ENTRIES.length ? ENTRIES.map((e) => ({ section: e.section, slug: e.slug })) : [{ section: "guides", slug: "none" }];
}

export async function GET(_req: Request, ctx: RouteContext<"/og/[section]/[slug]">) {
  const { section, slug } = await ctx.params;
  const e = ENTRIES.find((x) => x.section === section && x.slug === slug);
  if (!e) return new Response("Not found", { status: 404 });
  return renderEntryOg(e.section, e.slug);
}
