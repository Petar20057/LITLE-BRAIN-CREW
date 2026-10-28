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
export const DELIVERY_SECTIONS = catalog.sections as DeliverySection[];
export const DELIVERY_FILES = DELIVERY_SECTIONS.flatMap((s) => s.files);

// Products that come with another product's files: the 30-Day Reset includes The Kid Brain Toolkit.
const INCLUDES: Record<string, string[]> = { program: ["guide"] };

/** Every product an order with these item ids owns, including what its items come with. */
export const ownedProducts = (itemIds: string[]) => [...new Set(itemIds.flatMap((id) => [id, ...(INCLUDES[id] ?? [])]))];

/** The sections an order with these item ids is owed (the Bedtime Kit only with its $7 add-on or on its own). */
export function sectionsFor(itemIds: string[]): DeliverySection[] {
  const owned = ownedProducts(itemIds);
  return DELIVERY_SECTIONS.filter((s) => owned.includes(s.product));
}

/** The site's download route for one file of one order. The route checks the token and redirects to a signed link. */
export const downloadPath = (token: string, fileId: string) => `/api/download?t=${encodeURIComponent(token)}&f=${encodeURIComponent(fileId)}`;
