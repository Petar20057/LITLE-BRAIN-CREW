import { NextResponse } from "next/server";
import { SAMPLES } from "@/lib/email/samples";

// Development only: links to every email preview (see ./[name]/route.ts).
export function GET() {
  if (process.env.NODE_ENV === "production") return new NextResponse("Not found", { status: 404 });
  const links = Object.keys(SAMPLES)
    .map((n) => `<li><a href="/dev/emails/${n}">${n}</a> · <a href="/dev/emails/${n}?format=text">text</a></li>`)
    .join("");
  return new NextResponse(`<!doctype html><meta charset="utf-8"><title>Emails</title><body style="font:16px/1.6 system-ui;padding:24px"><h1>Emails</h1><ul>${links}</ul></body>`, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
