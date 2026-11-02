import "server-only";

import { createCheckout, productIdFor } from "./creem";
import { CURRENT_CATALOG_VERSION } from "./delivery-files";
import { SITE_URL } from "./design";
import { paidOrderForToken } from "./paid-order";
import { looseAdmin } from "./supabase/loose";

export class UpgradeError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function startResetUpgrade(token: string): Promise<{ url?: string; complete?: boolean }> {
  const order = await paidOrderForToken(token);
  if (!order) throw new UpgradeError(409, "Your Toolkit payment is still being confirmed. Please try again in a moment.");
  if (order.expired) throw new UpgradeError(410, "Your order link has expired. Please contact hello@littlebraincrew.com.");
  const ids = order.purchases.flatMap((p) => p.items);
  if (!ids.includes("guide")) throw new UpgradeError(403, "This upgrade is for Toolkit buyers.");
  if (ids.includes("program") || ids.includes("upgrade")) return { complete: true };
  const productId = productIdFor("upgrade");
  if (!productId) throw new UpgradeError(503, "The upgrade checkout is temporarily unavailable. Your Toolkit is ready in your downloads.");

  const db = looseAdmin();
  const { data: claimed, error } = await db.from("order_upgrades")
    .upsert({ parent_order_id: order.id }, { onConflict: "parent_order_id", ignoreDuplicates: true }).select("parent_order_id");
  if (error) throw error;
  let ownsClaim = Boolean(claimed?.length);
  if (!ownsClaim) {
    const { data: existing, error: readError } = await db.from("order_upgrades").select("checkout_url, state")
      .eq("parent_order_id", order.id).maybeSingle();
    if (readError) throw readError;
    if (existing?.checkout_url) return { url: existing.checkout_url };
    if (existing?.state === "failed") {
      const { data: retry, error: retryError } = await db.from("order_upgrades").update({ state: "creating" })
        .eq("parent_order_id", order.id).eq("state", "failed").select("parent_order_id");
      if (retryError) throw retryError;
      ownsClaim = Boolean(retry?.length);
    }
    if (!ownsClaim) throw new UpgradeError(409, "Your checkout is being prepared. Please try again in a moment.");
  }

  let url: string;
  try {
    url = await createCheckout({
      productId,
      email: order.email,
      successUrl: `${SITE_URL}/thank-you?upgrade=1`,
      requestId: `reset-upgrade-${order.id}`,
      metadata: { order: "upgrade", delivery: token, parent_order_id: order.id, catalog_version: String(CURRENT_CATALOG_VERSION) },
    });
  } catch {
    await db.from("order_upgrades").update({ state: "failed" }).eq("parent_order_id", order.id);
    throw new UpgradeError(502, "Payment couldn’t start. Please try again. Your Toolkit purchase is safe.");
  }
  const { error: saveError } = await db.from("order_upgrades").update({ checkout_url: url, state: "ready" })
    .eq("parent_order_id", order.id);
  // Never start a second checkout if Creem succeeded but persisting its URL failed.
  if (saveError) throw new UpgradeError(503, "Your checkout is being confirmed. Please try again shortly.");
  return { url };
}
