"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { isSessionId } from "@/lib/quiz-track";
import { looseAdmin } from "@/lib/supabase/loose";

// The two things the team does with a Personal plan request: mark the plan as sent (paid → replied) and close it
// (paid or replied → closed). Everything else about a request is written by the API route and the webhook.
const STEPS: Record<string, { from: string[]; at: string }> = {
  replied: { from: ["paid"], at: "replied_at" },
  closed: { from: ["paid", "replied"], at: "closed_at" },
};

export async function setPlanStatus(form: FormData): Promise<void> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  const step = STEPS[status];
  if (!isSessionId(id) || !step) return;
  const { error } = await looseAdmin().from("plan_requests").update({ status, [step.at]: new Date().toISOString() }).eq("id", id).in("status", step.from);
  if (error) console.error("[admin personal-plans] status not saved", { id, status }, error);
  revalidatePath("/admin/personal-plans");
}
