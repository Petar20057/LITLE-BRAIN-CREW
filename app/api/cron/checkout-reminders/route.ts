import { NextResponse, type NextRequest } from "next/server";
import { remindersOn, sendCheckoutReminders } from "@/lib/checkout-reminders";
import { supabaseConfigured } from "@/lib/supabase/env";

// Vercel Cron (vercel.json) calls this once a day with "Authorization: Bearer <CRON_SECRET>". Sends the abandoned-
// checkout reminders that are due (lib/checkout-reminders.ts). Does nothing until CHECKOUT_REMINDERS is "true".
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET ?? "";
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!remindersOn || !supabaseConfigured) return NextResponse.json({ sent: 0, skipped: 0, off: true });
  try {
    return NextResponse.json(await sendCheckoutReminders());
  } catch (err) {
    console.error("[checkout reminder] run failed", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
