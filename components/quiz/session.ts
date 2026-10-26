"use client";

import { VARIANTS, type StepId, type Variant } from "@/content/quiz";
import { isVariant, type QuizEvent } from "@/lib/quiz-track";

// One quiz visit, kept in session storage ("vlc-quiz") so a reload (Instagram's in-app browser does that a lot)
// carries on where the parent was. Nothing here leaves the browser except through track() and the email form.

export type Progress = {
  step: StepId;
  age: string | null;
  moments: string[];
  /** "Who's behind it?" guesses, by lesson: the crew key picked. */
  guesses: (string | null)[];
  /** Sleep check: school-night bedtime and wake-up in minutes after midnight; checked = answer shown. */
  sleep: { bed: number | null; wake: number | null; checked: boolean };
  /** Villain check: the habits ticked (villain keys); checked = answer shown. */
  villains: { picks: string[]; checked: boolean };
  /** Myth answers, by index: true = said "myth". */
  myths: (boolean | null)[];
  duo: string | null;
  emailed: boolean;
};

export type QuizSession = { sid: string; variant: Variant; progress: Progress };

const KEY = "vlc-quiz";
export const START: Progress = {
  step: "intro", age: null, moments: [], guesses: [null, null, null], sleep: { bed: null, wake: null, checked: false },
  villains: { picks: [], checked: false }, myths: [null, null, null], duo: null, emailed: false,
};

let current: QuizSession | null = null;

function load(): QuizSession {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as QuizSession | null;
    // Fills fields added since the visit started (a tab kept open across a deploy).
    if (saved?.sid && isVariant(saved.variant)) {
      const p = { ...START, ...saved.progress };
      return { ...saved, progress: { ...p, myths: [...p.myths, null, null, null].slice(0, 3), guesses: [...p.guesses, null, null, null].slice(0, 3) } };
    }
  } catch {}
  const asked = new URLSearchParams(location.search).get("v");
  const keys = Object.keys(VARIANTS) as Variant[];
  const variant = isVariant(asked) ? asked : keys[Math.floor(Math.random() * keys.length)];
  return { sid: crypto.randomUUID(), variant, progress: START };
}

const subs = new Set<() => void>();
export function subscribe(cb: () => void) {
  subs.add(cb);
  return () => subs.delete(cb);
}

/** Stable snapshot for useSyncExternalStore; null on the server. */
export function getSession(): QuizSession {
  if (!current) {
    current = load();
    save(current.progress);
  }
  return current;
}

export function save(progress: Progress) {
  const s = (current ??= load());
  current = { ...s, progress };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(current));
  } catch {}
  subs.forEach((cb) => cb());
}

/** Where the visit came from, sent once with the first event. */
function origin() {
  const q = new URLSearchParams(location.search);
  const pick = (k: string) => (q.get(k) ?? "").slice(0, 80) || undefined;
  const ua = navigator.userAgent;
  return {
    utm_source: pick("utm_source"),
    utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"),
    keyword: pick("k"),
    referrer: document.referrer ? new URL(document.referrer).hostname.slice(0, 80) : undefined,
    device: /Instagram/i.test(ua) ? "instagram-app" : /FBAN|FBAV/i.test(ua) ? "facebook-app" : innerWidth < 768 ? "mobile" : "desktop",
  };
}

let sentOrigin = false;
let enteredAt = 0;

/** Starts the clock for the screen that just opened. */
export const markStep = () => {
  enteredAt = Date.now();
};
/** Milliseconds on the current screen. */
export const onStep = () => Date.now() - enteredAt;

/** Fire-and-forget event for /admin/quiz. Uses a beacon when the page is going away. */
export function track(event: QuizEvent, step: StepId, value?: unknown, ms?: number) {
  const s = getSession();
  const body: Record<string, unknown> = { sid: s.sid, variant: s.variant, step, event, value, ms };
  if (!sentOrigin) {
    body.origin = origin();
    sentOrigin = true;
  }
  const json = JSON.stringify(body);
  try {
    if (event === "leave" || event === "click") {
      navigator.sendBeacon("/api/quiz/event", new Blob([json], { type: "application/json" }));
      return;
    }
    fetch("/api/quiz/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: json, keepalive: true }).catch(() => {});
  } catch {}
}
