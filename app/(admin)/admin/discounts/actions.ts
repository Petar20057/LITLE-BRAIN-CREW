"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createDiscount, validateDiscount } from "@/lib/discounts";
import { CreemError, discountsConfigured } from "@/lib/creem";

export async function addDiscount(_previous: { error?: string; success?: string }, form: FormData): Promise<{ error?: string; success?: string }> {
  await requireAdmin();
  if (!discountsConfigured) return { error: "Discounts are not connected yet." };
  const input = {
    name: String(form.get("name") ?? "").trim(),
    code: String(form.get("code") ?? "").trim().toUpperCase(),
    percentage: Number(form.get("percentage") ?? ""),
    maxRedemptions: Number(form.get("maxRedemptions") ?? ""),
    products: form.getAll("products").map(String),
    expiry: String(form.get("expiry") ?? "").trim(),
  };
  const error = validateDiscount(input);
  if (error) return { error };
  try {
    const discount = await createDiscount(input);
    revalidatePath("/admin/discounts");
    return { success: `${discount.code} created: ${input.percentage}% off, maximum ${input.maxRedemptions} completed orders in total.` };
  } catch (error) {
    console.error("[admin discounts] create failed", error);
    if (error instanceof CreemError && error.status === 403) return { error: "The payment key needs discounts:read and discounts:write permissions. Connect a restricted discounts key to enable this page." };
    return { error: error instanceof CreemError && [400, 409, 422].includes(error.status)
      ? "This code could not be created. It may already exist; check the list and try a different code."
      : "Couldn’t confirm the code was created. Refresh the list before trying again." };
  }
}
