import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { itemsFor } from "@/lib/creem";
import { SITE_URL } from "@/lib/design";
import { DELIVERY_BUCKET, downloadPath, sectionsFor } from "@/lib/delivery-files";
import { sendEmail } from "@/lib/email/send";
import { orderReceipt } from "@/lib/email/templates";
import { recordServerEvent } from "@/lib/funnel-events";
import { looseAdmin } from "@/lib/supabase/loose";

// After a paid one-time order (Creem checkout.completed, app/api/creem/webhook/route.ts):
//   1. one row in `orders` (idempotent: a retried webhook changes nothing and sends nothing twice),
//   2. the server-side purchase event (with the amount),
//   3. the receipt email with one download link per file.
// Links are never public: /api/download checks the token and answers with a signed Storage link that lasts 15 minutes.

/** How long a signed Storage link lasts (each click makes a new one). */
export const SIGNED_LINK_SECONDS = 15 * 60;

/** The buyer's download token: created in /api/checkout, kept in the browser (thank-you page) and in the email. */
export const newDeliveryToken = () => randomBytes(24).toString("base64url");
export const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export type PaidOrder = { providerOrderId: string; email: string; orderKey: string; token: string | null };

/** Records a paid one-time order. Returns false for an order key we don't sell as one-time (nothing written). */
export async function recordPaidOrder(order: PaidOrder): Promise<boolean> {
  const ids = order.orderKey.split("+");
  const items = itemsFor(ids);
  if (!items || items.some((i) => i.every)) return false;

  const admin = looseAdmin();
  const address = order.email.trim().toLowerCase();
  const amountCents = items.reduce((sum, i) => sum + i.price, 0) * 100;
  const { data, error } = await admin
    .from("orders")
    .upsert(
      {
        provider_order_id: order.providerOrderId,
        email: address,
        order_key: order.orderKey,
        items: ids,
        amount_cents: amountCents,
        delivery_hash: order.token ? tokenHash(order.token) : null,
      },
      { onConflict: "provider_order_id", ignoreDuplicates: true },
    )
    .select("id");
  if (error) throw error;
  if (!data?.length) return true; // already recorded by an earlier delivery of this webhook

  // Bedtime Kit on its own is a "post" purchase (the upsell, sold after the Toolkit); anything else is a purchase.
  const name = order.orderKey === "bedtime-kit" ? "post_bump_purchase" : "purchase";
  try {
    await recordServerEvent(name, order.orderKey, amountCents);
  } catch (err) {
    console.error("[funnel] purchase event not saved", { order: order.providerOrderId }, err);
  }

  if (order.token) {
    try {
      const sections = sectionsFor(ids).map((s) => ({
        label: s.label,
        files: s.files.map((f) => ({ name: f.name, url: `${SITE_URL}${downloadPath(order.token!, f.id)}` })),
      }));
      await sendEmail(address, orderReceipt(items, sections), { tag: "order-receipt" });
    } catch (err) {
      // The order is saved and the thank-you page shows the same links; a failed email is only logged.
      console.error("[email] order receipt failed", { order: order.providerOrderId }, err);
    }
  } else {
    console.error("[email] order without a delivery token, receipt not sent", { order: order.providerOrderId });
  }
  return true;
}

/** A short-lived signed link to one file in the private bucket. */
export async function signedFileUrl(path: string): Promise<string> {
  const { data, error } = await looseAdmin().storage.from(DELIVERY_BUCKET).createSignedUrl(path, SIGNED_LINK_SECONDS);
  if (error || !data) throw error ?? new Error("no signed URL returned");
  return data.signedUrl;
}
