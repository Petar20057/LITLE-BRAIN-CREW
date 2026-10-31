// The /code result, worked out the same way on the result screen and in the result email.
import type { SleepVerdict } from "@/content/quiz";
import type { QuizChar, QuizData, QuizMoment, QuizVillain } from "./quiz";

/** What the parent answered that shapes the result (the rest is only tracked). */
export type QuizAnswers = {
  age: string | null;
  moments: string[];
  /** School-night times in minutes after midnight; a bedtime of 24:00 or later is past midnight. */
  sleep?: { bed: number; wake: number } | null;
  /** Villain keys from the "which of these happen at your house?" check. */
  villains?: string[] | null;
};

export type QuizSleep = { hours: number; verdict: SleepVerdict; says: string };

export type QuizResult = {
  age: QuizData["ages"][number];
  picks: QuizMoment[];
  /** The crew member behind the first moment picked: the Toolkit starts there. */
  lead: QuizMoment;
  sleep?: QuizSleep;
  /** Villains the parent said live at home, in check order. */
  home: QuizVillain[];
  /** The one to beat first: from the home check, else from the moments picked. */
  villain?: QuizChar;
  /** Three nights, one tip each: the first moment, the first home villain, short sleep, then the other moments. */
  nights: string[];
};

/** The moment as this age sees it: kids under 6 get the wording without homework. Lives here, not in lib/quiz.ts, so the client bundle stays free of Learn content. */
export const forAge = (m: QuizMoment, age?: { young: boolean }): QuizMoment => (age?.young && m.youngLabel ? { ...m, label: m.youngLabel } : m);

/** Hours of sleep between bedtime and wake-up, to the nearest half hour. */
export const sleepHours = (bed: number, wake: number) => Math.round(((wake + 24 * 60 - bed) / 60) * 2) / 2;

export function sleepCheck(data: QuizData, ageId: string | null, s: QuizAnswers["sleep"]): QuizSleep | undefined {
  const age = data.ages.find((a) => a.id === ageId);
  if (!age || !s) return undefined;
  const hours = sleepHours(s.bed, s.wake);
  const verdict: SleepVerdict = hours < age.sleep.min ? "short" : hours > age.sleep.max ? "long" : "ok";
  return { hours, verdict, says: age.sleep.says };
}

export function quizResult(data: QuizData, a: QuizAnswers): QuizResult | null {
  const age = data.ages.find((x) => x.id === a.age);
  const picks = a.moments.map((id) => data.moments.find((m) => m.id === id)).filter((m): m is QuizMoment => Boolean(m)).map((m) => forAge(m, age));
  if (!age || !picks.length) return null;
  const sleep = sleepCheck(data, a.age, a.sleep);
  const home = data.villains.filter((v) => a.villains?.includes(v.char.key));

  const tips = [
    picks[0].tips[0],
    home[0]?.tip,
    sleep?.verdict === "short" ? data.sleep.short.tip : undefined,
    ...picks.slice(1).map((m) => m.tips[0]),
    ...picks.flatMap((m) => m.tips.slice(1)),
  ];
  const nights = tips.filter((t, i): t is string => Boolean(t) && tips.indexOf(t) === i).slice(0, 3);

  return { age, picks, lead: picks[0], sleep, home, villain: home[0]?.char ?? picks.find((m) => m.villain)?.villain, nights };
}

/** The crew members behind the picks, each once. */
export const crewOf = (r: QuizResult) => r.picks.map((m) => m.char).filter((c, i, all) => all.findIndex((x) => x.key === c.key) === i);

/** "9.5" → "9½". */
export const hoursLabel = (h: number) => `${Math.floor(h)}${h % 1 ? "½" : ""}`;

/** The two offers after the result. The Toolkit opens on the first moment picked (its page and crew member), and both
 *  carry the quiz visit (?qs=), so the checkout click and the purchase count on /admin/quiz. */
export function offerLinks(r: QuizResult, sid?: string | null) {
  const qs = sid ? `&qs=${encodeURIComponent(sid)}` : "";
  return {
    guide: `/checkout/guide?crew=${r.lead.char.key}&moment=${r.lead.toolkit}${qs}`,
    program: `/checkout/program?crew=${r.lead.char.key}${qs}`,
  };
}
