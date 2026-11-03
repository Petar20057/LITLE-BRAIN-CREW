import catalog from "./delivery-files.json";

// What a buyer downloads, and which order item it belongs to. Files live in a PRIVATE Supabase Storage bucket
// (never web/public). Nothing here is a link: links are made per buyer after a paid order, by /api/download.
// The same JSON feeds scripts/upload-delivery.mjs, so the uploaded paths can't drift from this list.
// Client-safe (no secrets): the thank-you page uses it too.

export type DeliveryKind = "pdf" | "video" | "audio" | "zip";
export type DeliveryFile = { id: string; path: string; name: string; kind: DeliveryKind };
/** A group of files under one label. `product` is the order item id (lib/funnel.ts) that unlocks it. */
export type DeliverySection = { product: string; label: string; files: DeliveryFile[] };

export const DELIVERY_BUCKET: string = catalog.bucket;
export const CURRENT_CATALOG_VERSION = 2;
export type CatalogVersion = 1 | 2;
export const catalogVersion = (value: unknown): CatalogVersion => value === 2 || value === "2" ? 2 : 1;
export const DELIVERY_SECTIONS = catalog.sections as DeliverySection[];
export const LEGACY_DELIVERY_SECTIONS = catalog.legacySections as DeliverySection[];
export const DELIVERY_FILES = [...DELIVERY_SECTIONS, ...LEGACY_DELIVERY_SECTIONS].flatMap((s) => s.files);

// Version 1 bundles retain their original files. In version 2, the Reset upgrade unlocks only the Reset bundle.
const LEGACY_INCLUDES: Record<string, string[]> = { program: ["guide"], upgrade: ["program", "guide"] };
const INCLUDES: Record<string, string[]> = { upgrade: ["program"] };

/** Every product an order with these item ids owns, including what its items come with. */
export const ownedProducts = (itemIds: string[], version: CatalogVersion = CURRENT_CATALOG_VERSION) => {
  const includes = version === 1 ? LEGACY_INCLUDES : INCLUDES;
  return [...new Set(itemIds.flatMap((id) => [id, ...(includes[id] ?? [])]))];
};

/** The sections an order with these item ids is owed (the Bedtime Kit only with its $7 add-on or on its own). */
export function sectionsFor(itemIds: string[], version: CatalogVersion = CURRENT_CATALOG_VERSION): DeliverySection[] {
  const owned = ownedProducts(itemIds, version);
  return (version === 1 ? LEGACY_DELIVERY_SECTIONS : DELIVERY_SECTIONS).filter((s) => owned.includes(s.product));
}

export type PaidPurchase = { items: string[]; catalogVersion: CatalogVersion; amountCents: number; eventId?: string };

/** A legacy Toolkit and a new Reset upgrade may coexist under the same buyer's token. */
export function sectionsForPurchases(purchases: PaidPurchase[]): DeliverySection[] {
  const seen = new Set<string>();
  return purchases.flatMap((p) => sectionsFor(p.items, p.catalogVersion)).flatMap((s) => {
    const files = s.files.filter((f) => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
    return files.length ? [{ ...s, files }] : [];
  });
}

/** The site's download route for one file of one order. The route checks the token and redirects to a signed link. */
export const downloadPath = (token: string, fileId: string) => `/api/download?t=${encodeURIComponent(token)}&f=${encodeURIComponent(fileId)}`;
