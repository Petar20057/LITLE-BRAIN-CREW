// Deletes one person's data when they ask (privacy policy, "Your choices"). Dry run by default: it only counts.
//
//   node scripts/delete-person.mjs parent@example.com          what would be deleted
//   node scripts/delete-person.mjs parent@example.com --yes    deletes it, in the database .env.local points at
//
// Removes, by email: every form signup, the quiz lead and the quiz visit it came from (its clicks go with it), and the
// Supabase account (its members row, subscriptions and cancel feedback cascade). Refuses while a Crew Club
// subscription is live: cancel it in Creem first. What this can't reach is printed at the end, to do by hand.
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY from .env.local, like scripts/create-admin.mjs.
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const envFile = path.resolve(import.meta.dirname, "../.env.local");
for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const email = (process.argv[2] ?? "").trim().toLowerCase();
const really = process.argv.includes("--yes");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage: node scripts/delete-person.mjs <email> [--yes]");
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !secret) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
const must = ({ data, error }) => {
  if (error) throw error;
  return data;
};

const signups = must(await db.from("signups").select("id, form").eq("email", email));
const lead = must(await db.from("quiz_leads").select("id, session_id").eq("email", email).maybeSingle());
const member = must(await db.from("members").select("id").eq("email", email).maybeSingle());
const live = member
  ? must(await db.from("subscriptions").select("id, status").eq("member_id", member.id).in("status", ["trialing", "active", "past_due", "unpaid", "paused", "scheduled_cancel"]))
  : [];

console.log(`${email} (${new URL(url).host})`);
console.log(`  form signups:  ${signups.length}${signups.length ? ` (${signups.map((s) => s.form).join(", ")})` : ""}`);
console.log(`  quiz lead:     ${lead ? `yes${lead.session_id ? ", with its quiz visit" : ""}` : "no"}`);
console.log(`  account:       ${member ? "yes" : "no"}`);

if (live.length) {
  console.error(`\nNot deleting: ${live.length} live Crew Club subscription(s). Cancel in the Creem dashboard first, then run this again.`);
  process.exit(1);
}

if (!really) {
  console.log("\nDry run. Add --yes to delete.");
  process.exit(0);
}

if (signups.length) must(await db.from("signups").delete().eq("email", email));
if (lead) {
  must(await db.from("quiz_leads").delete().eq("id", lead.id));
  if (lead.session_id) must(await db.from("quiz_sessions").delete().eq("id", lead.session_id));
}
if (member) {
  const { error } = await db.auth.admin.deleteUser(member.id);
  if (error) throw error;
}

console.log("\nDeleted. By hand, still:");
console.log("  1. Amazon SES (eu-north-1) → Suppression list → Add email address, reason Complaint: we never email it again.");
console.log("  2. Hostinger inbox: delete their emails to hello@ if they asked for that too.");
console.log("  3. Creem: if they bought anything, Creem (merchant of record) keeps the order; forward the request to Creem support.");
console.log("  4. Reply to them that it's done.");
