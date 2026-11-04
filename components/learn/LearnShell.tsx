import header from "@/content/partials/header.json";
import footer from "@/content/partials/footer.json";
import salesHeader from "@/content/partials/sales-header.json";
import salesFooter from "@/content/partials/sales-footer.json";
import PageScripts from "@/components/PageScripts";

// The design's own header and footer (content/partials, made by scripts/sync-design.mjs) around a page's content.
// crew-art.js and site.js load after the page so the mom/dad switch and the progress bar keep working.
// `sales`: the no-exit version for a sales page (only the logo on top, a small legal footer), like design/toolkit.html.
export default function LearnShell({ children, sales = false }: { children: React.ReactNode; sales?: boolean }) {
  return (
    <>
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: (sales ? salesHeader : header).html }} />
      <main id="main">{children}</main>
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: (sales ? salesFooter : footer).html }} />
      <PageScripts scripts={["crew-art.js", "site.js"]} bodyData={{}} />
    </>
  );
}
