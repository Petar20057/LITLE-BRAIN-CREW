import Text from "./Text";

type Myth = { claim: string; verdict: "Myth" | "Mostly myth" | "Half true"; truth: string };

export default function MythVerdict({ myth }: { myth: Myth }) {
  const tone = myth.verdict === "Half true" ? "half" : "myth";
  return (
    <section className="myth-box" data-tone={tone} aria-labelledby="verdict-h">
      <h2 id="verdict-h">The verdict</h2>
      <p className="myth-claim"><span>The claim</span>“<Text>{myth.claim}</Text>”</p>
      <p className="myth-stamp" aria-label={`Verdict: ${myth.verdict}`}>{myth.verdict}</p>
      <p><Text>{myth.truth}</Text></p>
    </section>
  );
}
