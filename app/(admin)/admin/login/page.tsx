import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin";
import { signIn } from "../actions";

// Reads the sign-in cookie on every request.
export const instant = false;

export default async function Page({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <form className="fx-card fx-narrow" style={{ margin: "24px auto 0" }} action={signIn}>
      <h1>Admin</h1>
      <p className="fx-sub">Little Brain Crew team only.</p>
      {error && <p className="adm-error" role="alert">Wrong email or password.</p>}
      <label className="fx-field">
        Email
        <input type="email" name="email" autoComplete="username" required />
      </label>
      <label className="fx-field">
        Password
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      <button className="btn btn-main" type="submit">Sign in</button>
    </form>
  );
}
