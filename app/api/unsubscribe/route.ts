import { NextResponse, type NextRequest } from "next/server";
import { unsubscribeToken } from "@/lib/consent";

// One-click unsubscribe (RFC 8058): mail apps POST here from the List-Unsubscribe header that lib/email/send.ts
// adds to list mail (unsubscribeUrl = `${EMAIL_BASE}/api/unsubscribe?t=<token>`). People clicking the link in the
// email body go to the /unsubscribe page instead.
export async function POST(request: NextRequest) {
  try {
    const result = await unsubscribeToken(request.nextUrl.searchParams.get("t"));
    return NextResponse.json({ result }, { status: result === "unknown" ? 404 : 200 });
  } catch (err) {
    console.error("[unsubscribe] failed", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
