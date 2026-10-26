"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { STATS_COOKIE, tokenMatches } from "./auth";

/** The /stats/quiz password form. A wrong token just shows the form again. */
export async function signIn(form: FormData) {
  const token = String(form.get("token") ?? "");
  if (tokenMatches(token)) {
    (await cookies()).set(STATS_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/stats", maxAge: 60 * 60 * 24 * 30 });
  }
  redirect("/stats/quiz");
}
