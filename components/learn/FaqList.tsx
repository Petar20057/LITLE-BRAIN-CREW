import Text from "./Text";

export default function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="faq-list">
      {faqs.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p><Text>{f.a}</Text></p>
        </details>
      ))}
    </div>
  );
}
