import { Fragment } from "react";
import { boldParts } from "@/lib/learn";

/** Plain text with **bold** rendered as <strong>. Everything else is escaped by React. */
export default function Text({ children }: { children: string }) {
  return (
    <>
      {boldParts(children).map((p, i) => (p.bold ? <strong key={i}>{p.text}</strong> : <Fragment key={i}>{p.text}</Fragment>))}
    </>
  );
}
