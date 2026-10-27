"use server";

import { redirect } from "next/navigation";
import { confirmToken, unsubscribeToken } from "@/lib/consent";

/** The button on /confirm (a page, not the emailed link itself, so mail scanners never confirm anyone). */
export async function confirmAction(form: FormData) {
  redirect(`/confirm?done=${await confirmToken(form.get("t"))}`);
}

/** The button on /unsubscribe. */
export async function unsubscribeAction(form: FormData) {
  redirect(`/unsubscribe?done=${await unsubscribeToken(form.get("t"))}`);
}
