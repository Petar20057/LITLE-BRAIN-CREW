import Text from "./Text";

type Pair = { instead: string; say: string; why?: string };

/** “Instead of X, say Y” cards. */
export default function SayThis({ pairs }: { pairs: Pair[] }) {
  return (
    <ul className="say-list">
      {pairs.map((p) => (
        <li key={p.say}>
          <p className="say-instead"><span>Instead of</span><Text>{p.instead}</Text></p>
          <p className="say-say"><span>Say</span><Text>{p.say}</Text></p>
          {p.why ? <p className="say-why"><Text>{p.why}</Text></p> : null}
        </li>
      ))}
    </ul>
  );
}
