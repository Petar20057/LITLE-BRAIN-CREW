import { NextResponse, type NextRequest } from "next/server";
import { allow, tooMany } from "@/lib/rate-limit";
import { startResetUpgrade, UpgradeError } from "@/lib/upgrades";

export async function POST(request: NextRequest) {
  if (!(await allow("checkout", request))) return tooMany();
  const body = await request.json().catch(() => null);
  if (typeof body?.token !== "string" || !body.token || body.token.length > 100) {
    return NextResponse.json({ error: "Please open the upgrade from your Toolkit order." }, { status: 400 });
  }
  try {
    return NextResponse.json(await startResetUpgrade(body.token), { headers: { "cache-control": "private, no-store" } });
  } catch (error) {
    if (error instanceof UpgradeError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[upgrade] checkout failed");
    return NextResponse.json({ error: "The upgrade couldn’t start. Please try again shortly." }, { status: 503 });
  }
}
