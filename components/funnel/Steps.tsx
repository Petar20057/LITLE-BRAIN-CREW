// Order → (offers) → done. Showing "Order ✓" on the offer pages tells people they already paid.
export default function Steps({ current }: { current: string }) {
  const steps = ["Order", current, "Done"].filter((s, i, a) => a.indexOf(s) === i);
  const at = steps.indexOf(current);
  return (
    <ol className="fx-steps" aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s} className={i < at ? "done" : i === at ? "on" : undefined} aria-current={i === at ? "step" : undefined}>
          {i < at ? `${s} ✓` : s}
        </li>
      ))}
    </ol>
  );
}
