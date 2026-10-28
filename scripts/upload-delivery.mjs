#!/usr/bin/env node
// Uploads what buyers download to the PRIVATE Supabase Storage bucket (lib/delivery-files.json names every file).
// Files come from ../products/delivery/ and never go into web/public.
//
//   node scripts/upload-delivery.mjs         dry run: checks every file is there and prints what would upload
//   node scripts/upload-delivery.mjs --yes   creates the private bucket if it's missing, then uploads (overwrites) each file
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in the environment. This script never reads .env files:
// load them yourself in the shell (for example: set -a; . ./.env.local; set +a) before running it.
// Run it once, after the owner has approved the files. It is an ops step, not part of the build.

import { createClient } from "@supabase/supabase-js";
import { readFileSync, statSync, existsSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(here, "../../products/delivery");
const catalog = JSON.parse(readFileSync(join(here, "../lib/delivery-files.json"), "utf8"));
const files = catalog.sections.flatMap((s) => s.files);
const BUCKET = catalog.bucket;
const TYPES = { ".pdf": "application/pdf", ".mp4": "video/mp4", ".mp3": "audio/mpeg", ".zip": "application/zip" };
const MB = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const apply = process.argv.includes("--yes");

// 1. Every file the site will link to must exist locally, or the site would hand out broken links.
const missing = files.filter((f) => !existsSync(join(SOURCE, f.path)));
if (missing.length) {
  console.error("Missing in products/delivery:\n" + missing.map((f) => `  ${f.path}`).join("\n"));
  process.exit(1);
}
const plan = files.map((f) => ({ ...f, local: join(SOURCE, f.path), bytes: statSync(join(SOURCE, f.path)).size, type: TYPES[extname(f.path)] }));
if (plan.some((f) => !f.type)) {
  console.error("Unknown file type:", plan.filter((f) => !f.type).map((f) => f.path));
  process.exit(1);
}
for (const f of plan) console.log(`${MB(f.bytes).padStart(9)}  ${f.path}`);
console.log(`${files.length} files, ${MB(plan.reduce((n, f) => n + f.bytes, 0))} in total → bucket "${BUCKET}"`);

if (!apply) {
  console.log("\nDry run. Nothing uploaded. Add --yes to upload.");
  process.exit(0);
}

// 2. Connect with the secret key (server-side only; never commit it, never paste it into the browser).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY first.");
  process.exit(1);
}
const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

// 3. The bucket must exist and must be private. Create it private if missing; refuse to upload into a public one.
const { data: bucket, error: getError } = await supabase.storage.getBucket(BUCKET);
if (getError || !bucket) {
  const { error } = await supabase.storage.createBucket(BUCKET, { public: false, fileSizeLimit: 524288000 });
  if (error) throw error;
  console.log(`Created private bucket "${BUCKET}".`);
} else if (bucket.public) {
  console.error(`Bucket "${BUCKET}" is PUBLIC. Make it private in the Supabase dashboard first, then run again.`);
  process.exit(1);
}

// 4. Upload. Existing objects are replaced, so a corrected file goes live under the same path.
for (const f of plan) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(f.path, readFileSync(f.local), { contentType: f.type, upsert: true, cacheControl: "3600" });
  if (error) throw error;
  console.log(`uploaded ${f.path}`);
}
console.log("Done. The site issues signed links to these files only after a paid order.");
