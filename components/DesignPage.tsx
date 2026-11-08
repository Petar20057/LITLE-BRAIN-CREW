import { PAGES, SITE_URL, type PageName } from "@/lib/design";
import PageScripts from "./PageScripts";

/** `slots`: ready-made HTML (built on the server, never user input) that replaces the `<div data-slot="name"></div>`
 *  placeholders in a design page (design/<page>.html), for the few parts that come from data. It is a string replace,
 *  not a React child, so the page's own tags stay balanced inside one element. */
export default function DesignPage({ name, slots = {} }: { name: PageName; slots?: Record<string, string> }) {
  const p = PAGES[name];
  const html = p.html.replace(/<div data-slot="([\w-]+)"><\/div>/g, (_, slot: string) => slots[slot] ?? "");
  return (
    <>
      {p.jsonLd.map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld.replaceAll("https://YOUR-DOMAIN", SITE_URL) }} />
      ))}
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: html }} />
      <PageScripts scripts={p.scripts} bodyData={p.bodyData} />
    </>
  );
}
