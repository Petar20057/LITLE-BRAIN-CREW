import { NextResponse, type NextRequest } from "next/server";
import { paidOrderForToken } from "@/lib/paid-order";
import { allow, tooMany } from "@/lib/rate-limit";

const headers = { "cache-control": "private, no-store" };

/** Read-only status, with the bearer token in a JSON body rather than a logged query string. */
export async function POST(request: NextRequest) {
  if (!(await allow("orderStatus", request))) return tooMany();
  const body = await request.json().catch(() => null);
  if (typeof body?.token !== "string") return NextResponse.json({ error: "Invalid order link." }, { status: 400, headers });
  try {
    const order = await paidOrderForToken(body.token);
    if (!order) return NextResponse.json({ pending: true }, { status: 404, headers });
    if (order.expired) return NextResponse.json({ error: "Your download link has expired. Please contact hello@littlebraincrew.com." }, { status: 410, headers });
    return NextResponse.json({ purchases: order.purchases }, { headers });
  } catch {
    return NextResponse.json({ error: "We couldn’t confirm your order. Please try again." }, { status: 503, headers });
  }
}
