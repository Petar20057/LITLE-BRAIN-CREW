import { NextResponse, type NextRequest } from "next/server";
import { sendChallengeEmails } from "@/lib/free-offers";
import { supabaseConfigured } from "@/lib/supabase/env";

// Vercel Cron (vercel.json) calls this once a day with "Authorization: Bearer <CRON_SECRET>". Sends the next day of the
// 5-day Screen-Off Challenge to everyone due one (lib/free-offers.ts).
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET ?? "";
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseConfigured) return NextResponse.json({ sent: 0, off: true });
  try {
    return NextResponse.json(await sendChallengeEmails());
  } catch (err) {
    console.error("[challenge] run failed", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
