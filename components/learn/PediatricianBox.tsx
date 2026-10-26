import Text from "./Text";

export default function PediatricianBox({ children }: { children: string }) {
  return (
    <aside className="ped-box" aria-labelledby="ped-h">
      <h2 id="ped-h">When to talk to your pediatrician</h2>
      <p><Text>{children}</Text></p>
    </aside>
  );
}
