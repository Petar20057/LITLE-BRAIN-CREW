// The /code result, worked out the same way on the result screen and in the result email.
import type { QuizChar, QuizData, QuizMoment } from "./quiz";

export type QuizResult = {
  age: QuizData["ages"][number];
  picks: QuizMoment[];
  /** The crew member behind the first moment picked: the Toolkit starts there. */
  lead: QuizMoment;
  villain?: QuizChar;
  /** Three nights, one tip each: the picked moments take turns, then their next tips. */
  nights: string[];
};

export function quizResult(data: QuizData, ageId: string | null, momentIds: string[]): QuizResult | null {
  const age = data.ages.find((a) => a.id === ageId);
  const picks = momentIds.map((id) => data.moments.find((m) => m.id === id)).filter((m): m is QuizMoment => Boolean(m));
  if (!age || !picks.length) return null;
  const nights: string[] = [];
  for (let i = 0; nights.length < 3 && i < 9; i++) {
    const tip = picks[i % picks.length].tips[Math.floor(i / picks.length)];
    if (tip && !nights.includes(tip)) nights.push(tip);
  }
  return { age, picks, lead: picks[0], villain: picks.find((m) => m.villain)?.villain, nights };
}

/** The crew members behind the picks, each once. */
export const crewOf = (r: QuizResult) => r.picks.map((m) => m.char).filter((c, i, all) => all.findIndex((x) => x.key === c.key) === i);
