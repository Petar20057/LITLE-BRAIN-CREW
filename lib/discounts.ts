import "server-only";

import { creemRequest, discountProducts } from "./creem";

export type Discount = {
  id: string;
  mode: string;
  code: string;
  name: string;
  status: string;
  type: "percentage" | "fixed";
  percentage?: number;
  amount?: number;
  currency?: string;
  max_redemptions?: number | null;
  redeem_count?: number;
  expiry_date?: string | null;
  applies_to_products?: string[];
};

export type DiscountList = {
  items: Discount[];
  pagination: { current_page: number; next_page: number | null; prev_page: number | null; total_records: number };
};

export type DiscountInput = {
  name: string;
  code: string;
  percentage: number;
  maxRedemptions: number;
  products: string[];
  expiry: string;
};

export function validateDiscount(input: DiscountInput): string | null {
  if (!input.name || input.name.length > 80) return "Enter a name of up to 80 characters.";
  if (!/^[A-Z0-9]{3,14}$/.test(input.code)) return "Use 3–14 letters and numbers for the code.";
  if (!Number.isInteger(input.percentage) || input.percentage < 1 || input.percentage > 100) return "Discount must be a whole percentage from 1 to 100.";
  if (!Number.isSafeInteger(input.maxRedemptions) || input.maxRedemptions < 1 || input.maxRedemptions > 1_000_000) return "Maximum uses must be a whole number from 1 to 1,000,000.";
  const available = new Set(discountProducts().map((product) => product.id));
  if (!input.products.length || input.products.some((id) => !available.has(id))) return "Choose at least one available product.";
  if (input.expiry) {
    const expiry = Date.parse(`${input.expiry}T23:59:59Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.expiry) || !Number.isFinite(expiry) || new Date(expiry).toISOString().slice(0, 10) !== input.expiry || expiry <= Date.now()) return "Choose an expiry date in the future, or leave it empty.";
  }
  return null;
}

export async function createDiscount(input: DiscountInput): Promise<Discount> {
  const error = validateDiscount(input);
  if (error) throw new Error(error);
  // Creem enforces this shared limit when an order completes, including simultaneous checkouts.
  // "once" applies to this purchase only, never to every future subscription renewal.
  return creemRequest<Discount>("discounts", "POST", {
    name: input.name,
    code: input.code,
    type: "percentage",
    percentage: input.percentage,
    duration: "once",
    max_redemptions: input.maxRedemptions,
    applies_to_products: [...new Set(input.products)],
    ...(input.expiry ? { expiry_date: `${input.expiry}T23:59:59Z` } : {}),
  });
}

export function listDiscounts(page: number): Promise<DiscountList> {
  return creemRequest(`discounts/search?page_number=${page}&page_size=20`);
}

export function discountStatus(discount: Discount): string {
  if (discount.status !== "active") return discount.status;
  if (discount.expiry_date && Date.parse(discount.expiry_date) <= Date.now()) return "expired";
  if (discount.max_redemptions != null && (discount.redeem_count ?? 0) >= discount.max_redemptions) return "fully used";
  return "active";
}
