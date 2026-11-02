import "server-only";

import { tokenHash } from "./delivery";
import { catalogVersion, type PaidPurchase } from "./delivery-files";
import { looseAdmin } from "./supabase/loose";

/** Only webhook-confirmed orders are returned. A child upgrade shares the original download token. */
export async function paidOrderForToken(token: string) {
  if (!token || token.length > 100) return null;
  const db = looseAdmin();
  const { data: order, error } = await db.from("orders")
    .select("id, email, items, catalog_version, amount_cents, download_until")
    .eq("delivery_hash", tokenHash(token)).maybeSingle();
  if (error) throw error;
  if (!order) return null;
  const { data: upgrades, error: upgradeError } = await db.from("orders")
    .select("items, catalog_version, amount_cents").eq("parent_order_id", order.id);
  if (upgradeError) throw upgradeError;
  const purchases: PaidPurchase[] = [order, ...(upgrades ?? [])].map((p) => ({
    items: p.items,
    catalogVersion: catalogVersion(p.catalog_version),
    amountCents: p.amount_cents,
  }));
  return { id: order.id as string, email: order.email as string, expired: new Date(order.download_until) < new Date(), purchases };
}
