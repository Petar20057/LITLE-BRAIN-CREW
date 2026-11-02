import { ITEMS } from "@/lib/funnel";
import { ARTICLE_GROUP, BOX_GROUPS } from "@/lib/article-boxes";
import BuyToolkitButton from "./BuyToolkitButton";
import FreeListForm from "./FreeListForm";

// The one soft sell at the end of each entry: the copy for the article's group, the Toolkit button and the free-tips
// form. Paths outside the plan's groups get the generic copy. Habits and learning only, no health claims.
const GENERIC = {
  heading: "Want the whole crew on your side?",
  text: `${ITEMS.guide.name}: 12 crew members, the 12 hardest moments decoded with the exact words, 6 villains, and what’s normal at every age.`,
};

export default function ToolkitCta({ path }: { path: string }) {
  const group = ARTICLE_GROUP[path];
  const box = group ? BOX_GROUPS[group] : GENERIC;

  return (
    <div className="cta-box surface">
      <h3>{box.heading}</h3>
      <p>{box.text}</p>
      <BuyToolkitButton place={group ? `article-${group}` : "article"} />
      <p className="fine" style={{ marginTop: 12 }}>Instant download: 43-page Toolkit, printable bonuses and 4 crew cartoons.</p>
      <hr style={{ border: 0, borderTop: "1px solid var(--hair)", margin: "24px 0" }} />
      <p>Not ready? Get 15 free ways to end screen time without tears.</p>
      <FreeListForm />
      <p className="fine" style={{ marginTop: 16 }}>Educational only, not medical advice.</p>
    </div>
  );
}
