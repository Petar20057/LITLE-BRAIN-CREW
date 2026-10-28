import { randomUUID } from "node:crypto";

// An in-memory stand-in for the Supabase client, with just the query methods the routes use: select, insert, update,
// upsert, eq, is, or, maybeSingle, rpc("rate_limit_hit") and auth.admin.createUser (with the members trigger).
// Rows get the same defaults as the migrations, so a route sees what it would see in the real database.

type Row = Record<string, unknown>;
type Filter = (r: Row) => boolean;

const now = () => new Date().toISOString();

const DEFAULTS: Record<string, () => Row> = {
  signups: () => ({ id: randomUUID(), confirm_token: randomUUID(), confirm_sent_at: null, confirmed_at: null, unsubscribed_at: null, created_at: now() }),
  quiz_leads: () => ({
    id: randomUUID(), token: randomUUID(), session_id: null, tips_consent: false, consent_at: null, tips_requested_at: null,
    result_emailed_at: null, unsubscribed_at: null, created_at: now(),
  }),
  quiz_sessions: () => ({ emailed_at: null, purchased_at: null, started_at: now() }),
  quiz_events: () => ({ created_at: now() }),
  subscriptions: () => ({ id: randomUUID(), provider_event_at: null, current_period_start: null, current_period_end: null, canceled_at: null, created_at: now() }),
  members: () => ({ creem_customer_id: null, created_at: now() }),
  orders: () => ({ id: randomUUID(), delivery_hash: null, download_until: "2999-01-01T00:00:00Z", created_at: now() }),
  funnel_events: () => ({ id: randomUUID(), visitor_id: null, session_id: null, place: null, path: null, amount_cents: null, created_at: now() }),
};

const CONFLICT_KEYS: Record<string, string[]> = { signups: ["email", "form"], quiz_sessions: ["id"], quiz_leads: ["email"], orders: ["provider_order_id"] };

function compare(value: unknown, op: string, arg: string): boolean {
  if (op === "is") return arg === "null" ? value == null : String(value) === arg;
  if (value == null) return false;
  const v = String(value);
  if (op === "eq") return v === arg;
  if (op === "lt") return v < arg;
  if (op === "lte") return v <= arg;
  if (op === "gt") return v > arg;
  if (op === "gte") return v >= arg;
  throw new Error(`fake-db: unsupported operator ${op}`);
}

/** PostgREST or() syntax as the routes write it: `a.is.null,a.lt."2026-…"`. */
function parseOr(expr: string): Filter {
  const parts = expr.match(/(?:[^,"]|"[^"]*")+/g) ?? [];
  const tests = parts.map((p) => {
    const [col, op, ...rest] = p.split(".");
    const arg = rest.join(".").replace(/^"|"$/g, "");
    return (r: Row) => compare(r[col], op, arg);
  });
  return (r) => tests.some((t) => t(r));
}

class Query implements PromiseLike<{ data: unknown; error: null; count?: number }> {
  private filters: Filter[] = [];
  private returning = false;
  private single = false;

  constructor(
    private db: FakeDb,
    private table: string,
    private op: "select" | "insert" | "update" | "upsert",
    private payload?: Row,
    private options?: { ignoreDuplicates?: boolean },
  ) {}

  select() {
    if (this.op !== "select") this.returning = true;
    return this;
  }
  eq(col: string, value: unknown) {
    this.filters.push((r) => r[col] === value);
    return this;
  }
  is(col: string, value: null) {
    this.filters.push((r) => (value === null ? r[col] == null : r[col] === value));
    return this;
  }
  or(expr: string) {
    this.filters.push(parseOr(expr));
    return this;
  }
  maybeSingle() {
    this.single = true;
    return this;
  }

  private run() {
    const rows = this.db.table(this.table);
    const match = (r: Row) => this.filters.every((f) => f(r));
    let out: Row[] = [];
    if (this.op === "select") out = rows.filter(match);
    if (this.op === "update") {
      out = rows.filter(match);
      out.forEach((r) => Object.assign(r, this.payload));
    }
    if (this.op === "insert" || this.op === "upsert") {
      const keys = CONFLICT_KEYS[this.table] ?? ["id"];
      const clash = rows.find((r) => keys.every((k) => r[k] === this.payload![k]));
      if (clash && this.op === "insert") throw new Error(`fake-db: duplicate key in ${this.table}`);
      if (clash && !this.options?.ignoreDuplicates) Object.assign(clash, this.payload);
      if (!clash) {
        const row = { ...(DEFAULTS[this.table]?.() ?? {}), ...this.payload };
        rows.push(row);
        out = [row];
      }
    }
    const data = this.single ? (out[0] ?? null) : this.op === "select" || this.returning ? out.map((r) => ({ ...r })) : null;
    return { data: this.single && data ? { ...(data as Row) } : data, error: null };
  }

  then<A = { data: unknown; error: null }, B = never>(ok?: ((v: { data: unknown; error: null }) => A | PromiseLike<A>) | null, fail?: ((e: unknown) => B | PromiseLike<B>) | null) {
    return Promise.resolve().then(() => this.run()).then(ok, fail);
  }
}

export class FakeDb {
  tables: Record<string, Row[]> = {};
  /** rate_limit_hit: hits per key in this test (the window never rolls over). */
  hits = new Map<string, number>();

  table(name: string) {
    return (this.tables[name] ??= []);
  }
  seed(name: string, row: Row) {
    this.table(name).push({ ...(DEFAULTS[name]?.() ?? {}), ...row });
  }
  reset() {
    this.tables = {};
    this.hits.clear();
  }

  client() {
    return {
      from: (table: string) => ({
        select: () => new Query(this, table, "select"),
        insert: (row: Row) => new Query(this, table, "insert", row),
        update: (patch: Row) => new Query(this, table, "update", patch),
        upsert: (row: Row, opts?: { ignoreDuplicates?: boolean }) => new Query(this, table, "upsert", row, opts),
      }),
      rpc: async (name: string, args: { p_key: string; p_max: number }) => {
        if (name !== "rate_limit_hit") throw new Error(`fake-db: unknown rpc ${name}`);
        const n = (this.hits.get(args.p_key) ?? 0) + 1;
        this.hits.set(args.p_key, n);
        return { data: n <= args.p_max, error: null };
      },
      auth: {
        admin: {
          createUser: async ({ email }: { email: string }) => {
            const id = randomUUID();
            this.seed("members", { id, email }); // on_auth_user_created
            return { data: { user: { id } }, error: null };
          },
        },
      },
    };
  }
}

export const fake = new FakeDb();
