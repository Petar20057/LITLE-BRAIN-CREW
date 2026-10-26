// Rules for the /code quiz tracking, shared by the browser (components/quiz) and app/api/quiz.
// Kept apart from lib/quiz.ts so the browser bundle doesn't pull in the Learn content.
import { STEPS, VARIANTS, type StepId, type Variant } from "@/content/quiz";

export const EVENTS = ["view", "answer", "back", "leave", "click"] as const;
export type QuizEvent = (typeof EVENTS)[number];

export const isStep = (s: unknown): s is StepId => typeof s === "string" && (STEPS as readonly string[]).includes(s);
export const isEvent = (s: unknown): s is QuizEvent => typeof s === "string" && (EVENTS as readonly string[]).includes(s);
export const isVariant = (s: unknown): s is Variant => typeof s === "string" && s in VARIANTS;
export const isSessionId = (s: unknown): s is string =>
  typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(s);
