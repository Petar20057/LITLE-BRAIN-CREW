import { getAdmin } from "@/lib/admin";
import { NEWSLETTER_FORMS } from "@/lib/analytics";
import { createAdminClient } from "@/lib/supabase/admin";

// Every signup and quiz email as CSV, for sending the newsletter or importing into an email tool.
// One row per email per form; "newsletter" says whether that row is newsletter consent: a newsletter form or the quiz
// tips, confirmed by the emailed link (double opt-in since 2026-10-27), and not unsubscribed.

const PAGE = 1000;
const cell = (v: unknown) => {
  const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  // Quote everything, and stop spreadsheets from running a cell as a formula.
  return `"${(/^[=+\-@\t\r]/.test(s) ? `'${s}` : s).replaceAll('"', '""')}"`;
};

async function all<T>(read: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>) {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await read(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) return rows;
  }
}

export async function GET() {
  if (!(await getAdmin())) return new Response("Not found", { status: 404 });
  const db = createAdminClient();
  const forms: readonly string[] = NEWSLETTER_FORMS;

  const [signups, leads] = await Promise.all([
    all((a, b) => db.from("signups").select("email, form, page, details, utm_source, created_at, confirmed_at, unsubscribed_at").order("created_at").range(a, b)),
    all((a, b) => db.from("quiz_leads").select("email, tips_consent, created_at, unsubscribed_at").order("created_at").range(a, b)),
  ]);

  const lines = [
    ["email", "form", "newsletter", "unsubscribed_at", "created_at", "page", "utm_source", "details"],
    ...signups.map((s) => [s.email, s.form, forms.includes(s.form) && s.confirmed_at && !s.unsubscribed_at ? "yes" : "no", s.unsubscribed_at, s.created_at, s.page, s.utm_source, s.details]),
    ...leads.map((l) => [l.email, "quiz", l.tips_consent && !l.unsubscribed_at ? "yes" : "no", l.unsubscribed_at, l.created_at, "/code", null, null]),
  ];
  const csv = lines.map((r) => r.map(cell).join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="lbc-emails-${date}.csv"`,
      "cache-control": "no-store",
    },
  });
}
