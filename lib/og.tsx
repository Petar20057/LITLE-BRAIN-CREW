// Open Graph cards for entry pages (1200x630): paper background, the character, the H1 and the brand.
import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { entryAt, type SectionKey } from "@/content/learn";
import { CHARS, OG_SIZE, artOf, charOf, plain } from "@/lib/learn";


const INK = "#1F1B2E";
const PAPER = "#FFFBF4";
// The horizontal logo from the brand package, inlined once per server start.
const LOGO = `data:image/svg+xml;base64,${fs.readFileSync(path.join(process.cwd(), "public/assets/brand/lbc-logo-horizontal.svg")).toString("base64")}`;

const svgDataUri = (inner: string) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${inner}</svg>`).toString("base64")}`;

export function renderEntryOg(section: SectionKey, slug: string) {
  const e = entryAt(section, slug);
  const title = e ? plain(e.h1) : "Little Brain Crew";
  const char = e ? charOf(e) : "dopa";
  const color = CHARS[char].color;
  // Long questions get a smaller size so they stay inside the card.
  const fontSize = title.length > 80 ? 48 : title.length > 56 ? 56 : 64;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: PAPER, color: INK, padding: 56 }}>
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", width: 420, height: 518, borderRadius: 48,
            background: color, border: `6px solid ${INK}`, flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={svgDataUri(artOf(char, "happy"))} width={360} height={360} alt="" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, paddingLeft: 56 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} width={222} height={80} alt="" />
          <div style={{ display: "flex", fontSize, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 28, color: "#57536A" }}>
            {e ? e.kicker : "Short cartoon explainers for parents of kids 4–17"}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
