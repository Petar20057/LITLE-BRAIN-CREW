"use server";

import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

/** The /admin/login form. A wrong password, or a parent's account without the admin role, shows the form again. */
export async function signIn(form: FormData) {
  if (!supabaseConfigured) redirect("/admin/login?error=1");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email") ?? "").trim().toLowerCase(),
    password: String(form.get("password") ?? ""),
  });
  if (error) redirect("/admin/login?error=1");
  if (!(await getAdmin())) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=1");
  }
  redirect("/admin");
}

export async function signOut() {
  if (supabaseConfigured) await (await createClient()).auth.signOut();
  redirect("/admin/login");
}
