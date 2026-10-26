import { PAGES, SITE_URL, type PageName } from "@/lib/design";
import PageScripts from "./PageScripts";

export default function DesignPage({ name }: { name: PageName }) {
  const p = PAGES[name];
  return (
    <>
      {p.jsonLd.map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld.replaceAll("https://YOUR-DOMAIN", SITE_URL) }} />
      ))}
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: p.html }} />
      <PageScripts scripts={p.scripts} bodyData={p.bodyData} />
    </>
  );
}
