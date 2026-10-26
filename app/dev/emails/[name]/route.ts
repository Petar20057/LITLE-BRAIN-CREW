import { NextResponse, type NextRequest } from "next/server";
import { EMAIL_BASE } from "@/lib/email/layout";
import { SAMPLES } from "@/lib/email/samples";
import { sendEmail } from "@/lib/email/send";

// Development only (404 in production): look at every email, and send yourself a test through SES.
//   GET  /dev/emails                         list
//   GET  /dev/emails/club-welcome            HTML, as the inbox shows it (?format=text for the text part)
//   POST /dev/emails/club-welcome?to=me@x    sends it for real (needs the SES keys in .env.local)

const off = () => process.env.NODE_ENV === "production";

export async function GET(request: NextRequest, ctx: RouteContext<"/dev/emails/[name]">) {
  const sample = SAMPLES[(await ctx.params).name];
  if (off() || !sample) return new NextResponse("Not found", { status: 404 });
  const email = sample();
  if (request.nextUrl.searchParams.get("format") === "text") {
    return new NextResponse(`Subject: ${email.subject}\nPreview: ${email.preheader}\n\n${email.text}`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  // Images and links point at the live site; show this server's copies so new art shows before it's deployed.
  return new NextResponse(email.html.replaceAll(EMAIL_BASE, request.nextUrl.origin), { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function POST(request: NextRequest, ctx: RouteContext<"/dev/emails/[name]">) {
  const sample = SAMPLES[(await ctx.params).name];
  const to = request.nextUrl.searchParams.get("to") ?? "";
  if (off() || !sample) return new NextResponse("Not found", { status: 404 });
  if (!/^\S+@\S+\.\S+$/.test(to)) return NextResponse.json({ error: "Add ?to=you@example.com" }, { status: 400 });
  const id = await sendEmail(to, sample(), { tag: "test" });
  return NextResponse.json(id ? { sent: true, messageId: id } : { sent: false, reason: "SES keys are not set in .env.local" });
}
