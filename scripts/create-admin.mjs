// Creates the /admin account, or gives an existing one the admin role and a new password.
//
//   node scripts/create-admin.mjs hello@littlebraincrew.com
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY from .env.local. Prints the new password once; it is not
// saved anywhere. A new account gets no members row (the signup trigger's row is removed), so it never counts as a parent.
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const envFile = path.resolve(import.meta.dirname, "../.env.local");
for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage: node scripts/create-admin.mjs <email>");
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !secret) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

// 24 characters from an alphabet without look-alikes (0/O, 1/l/I), easy to type from a phone.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const password = Array.from(randomBytes(24), (b) => ALPHABET[b % ALPHABET.length]).join("");

const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

async function findUser() {
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = data.users.find((u) => u.email === email);
    if (user || data.users.length < 1000) return user;
  }
}

const existing = await findUser();
const attrs = { password, email_confirm: true, app_metadata: { ...(existing?.app_metadata ?? {}), role: "admin" } };
const { data, error } = existing ? await db.auth.admin.updateUserById(existing.id, attrs) : await db.auth.admin.createUser({ email, ...attrs });
if (error) throw error;

// Only for a brand-new account: an existing one may be a real parent with a subscription (deleting cascades).
if (!existing) {
  const { error: memberError } = await db.from("members").delete().eq("id", data.user.id);
  if (memberError) throw memberError;
}

console.log(`${existing ? "Updated" : "Created"} admin ${email}`);
console.log(`Password: ${password}`);
