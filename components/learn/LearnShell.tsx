import header from "@/content/partials/header.json";
import footer from "@/content/partials/footer.json";
import PageScripts from "@/components/PageScripts";

// The design's own header and footer (content/partials, made by scripts/sync-design.mjs) around a page's content.
// crew-art.js and site.js load after the page so the mom/dad switch and the progress bar keep working.
export default function LearnShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: header.html }} />
      <main id="main">{children}</main>
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: footer.html }} />
      <PageScripts scripts={["crew-art.js", "site.js"]} bodyData={{}} />
    </>
  );
}
