import { NextResponse, type NextRequest } from "next/server";
import { DELIVERY_FILES, DELIVERY_SECTIONS, ownedProducts } from "@/lib/delivery-files";
import { signedFileUrl, tokenHash } from "@/lib/delivery";
import { looseAdmin } from "@/lib/supabase/loose";
import { supabaseConfigured } from "@/lib/supabase/env";

// One file for one paid order: GET /api/download?t=<token>&f=<file id> (the links on the thank-you page and in the
// receipt). The token is checked against the order's hash, the file must belong to what the order bought, and the
// answer is a redirect to a signed Storage link that lasts 15 minutes. Nothing is served from the site itself, and
// nothing is public: a wrong or expired token gets a plain message, never a file.

const plain = (message: string, status: number) =>
  new NextResponse(message, { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "private, no-store" } });

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t") ?? "";
  const fileId = request.nextUrl.searchParams.get("f") ?? "";
  const file = DELIVERY_FILES.find((f) => f.id === fileId);
  if (!supabaseConfigured || !token || token.length > 100 || !file) return plain("This link isn’t valid.", 404);

  try {
    const { data: order, error } = await looseAdmin()
      .from("orders")
      .select("items, download_until")
      .eq("delivery_hash", tokenHash(token))
      .maybeSingle();
    if (error) throw error;
    if (!order) return plain("Your order is still being confirmed. Give it a minute and try again, or use the link in your email.", 404);
    if (new Date(order.download_until) < new Date()) return plain("This download link has expired. Email hello@littlebraincrew.com and we’ll send a new one.", 410);
    // Each file is tied to the item that unlocks it (lib/delivery-files.json): a Toolkit order never opens the Bedtime Kit,
    // and a Reset order also opens the Toolkit it includes.
    const section = DELIVERY_SECTIONS.find((s) => s.files.some((f) => f.id === fileId));
    if (!section || !ownedProducts(order.items).includes(section.product)) return plain("This file isn’t part of your order.", 403);

    const url = await signedFileUrl(file.path);
    return NextResponse.redirect(url, { status: 302, headers: { "cache-control": "private, no-store" } });
  } catch (err) {
    console.error("[download] not served", { file: fileId }, err);
    return plain("The download couldn’t start. Please try again in a minute.", 503);
  }
}
