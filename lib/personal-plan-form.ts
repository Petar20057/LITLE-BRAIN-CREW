import { MOMENTS } from "./funnel";

// The Personal plan ($199, lib/funnel.ts ITEMS.personalPlan): what the intake form on /personal-plan asks, in one place.
// Shared by the form (browser), the API route (validation, lib/personal-plan.ts), the emails and the admin page (labels),
// so nothing here may be server-only. We never ask for the child's name, photo, school or health details: the Privacy page
// promises that, and the plan is about habits and words, not a diagnosis.

/** Working days in which the written plan lands in the parent's inbox (site copy, emails, Terms). */
export const PLAN_REPLY_DAYS = 3;
/** An unpaid form is deleted after this many days (prune_old_data(), the Privacy page, the "answers saved" email). */
export const UNPAID_KEEP_DAYS = 30;
/** Where a parent who saved the form pays later (the "answers saved" email, the admin panel): the payment step of /personal-plan. */
export const planPayPath = (id: string) => `/personal-plan?r=${encodeURIComponent(id)}#plan-form`;
export const AGE_MIN = 3;
export const AGE_MAX = 17;
export const NAME_MAX = 80;
/** The whole `answers` object, serialised: enough for every field at its maximum, nothing bigger. */
export const MAX_ANSWERS_BYTES = 8_000;

/** The 12 hard moments of the home page decoder (lib/funnel.ts MOMENTS), plus "something else". */
export const MOMENT_OPTIONS: readonly string[] = [...Object.keys(MOMENTS), "other"];
export const momentTitle = (key: string) => MOMENTS[key]?.title ?? (key === "other" ? "Something else" : key);

export const PLAN_STATUSES = ["new", "checkout", "paid", "replied", "closed"] as const;
export type PlanStatus = (typeof PLAN_STATUSES)[number];

export type Option = { value: string; label: string };
export type PlanField = {
  /** Column name inside `answers` (plan_requests.answers): lowercase letters and underscores only. */
  key: string;
  label: string;
  hint?: string;
  kind: "text" | "textarea" | "select" | "multi";
  /** Longest accepted text, or (select, multi) the longest option value. */
  max: number;
  required?: boolean;
  options?: readonly Option[];
};

export const HOW_LONG: readonly Option[] = [
  { value: "weeks", label: "A few weeks" },
  { value: "months", label: "A few months" },
  { value: "year", label: "A year or more" },
  { value: "always", label: "As long as I remember" },
];

export const OWNS: readonly Option[] = [
  { value: "toolkit", label: "The Kid Brain Toolkit" },
  { value: "reset", label: "The 30-Day Reset" },
  { value: "bedtime-kit", label: "The Bedtime & Screen-Off Kit" },
  { value: "nothing-yet", label: "Nothing yet" },
];

/** The detailed part of the form, in the order it is asked. `moment_other` is required only when the moment is "other". */
export const PLAN_FIELDS: readonly PlanField[] = [
  { key: "moment_other", label: "Tell us about the moment in a sentence or two", kind: "text", max: 300 },
  { key: "when_happens", label: "When does it happen, and how often?", hint: "For example: most school nights, right after the tablet goes off.", kind: "text", max: 300, required: true },
  { key: "how_long", label: "How long has it been like this?", kind: "select", max: 20, options: HOW_LONG },
  { key: "tried", label: "What have you tried, and what happened?", hint: "Rewards, timers, talking it through, letting it go… and how your kid reacted.", kind: "textarea", max: 1500, required: true },
  { key: "good_week", label: "What would a good week look like?", hint: "Be concrete: what would you see at 7 p.m. on a Tuesday?", kind: "textarea", max: 1000, required: true },
  { key: "routine", label: "A typical weekday", hint: "Wake-up, school, screens, dinner, bedtime. Rough times are fine.", kind: "textarea", max: 800 },
  { key: "household", label: "Who’s at home", hint: "Siblings, who does bedtime, anything about the week that matters.", kind: "textarea", max: 800 },
  { key: "owns", label: "What do you already have from us?", kind: "multi", max: 20, options: OWNS },
  { key: "timezone", label: "Your time zone", hint: "So the plan’s times match your evenings.", kind: "text", max: 60 },
  { key: "notes", label: "Anything else we should know?", hint: "No need to share your child’s name or medical details.", kind: "textarea", max: 1500 },
];

export const fieldByKey = (key: string) => PLAN_FIELDS.find((f) => f.key === key);
/** The label an admin or the team email shows for one stored answer value. */
export function answerLabel(field: PlanField, value: string | string[]): string {
  const list = Array.isArray(value) ? value : [value];
  return list.map((v) => field.options?.find((o) => o.value === v)?.label ?? v).join(", ");
}
