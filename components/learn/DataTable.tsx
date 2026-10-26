import Text from "./Text";

export default function DataTable({ table }: { table: { caption: string; head: string[]; rows: string[][] } }) {
  return (
    <div className="table-wrap" role="region" aria-label={table.caption} tabIndex={0}>
      <table className="learn-table">
        <caption>{table.caption}</caption>
        <thead>
          <tr>{table.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
        </thead>
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (j === 0 ? <th key={j} scope="row"><Text>{c}</Text></th> : <td key={j}><Text>{c}</Text></td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
