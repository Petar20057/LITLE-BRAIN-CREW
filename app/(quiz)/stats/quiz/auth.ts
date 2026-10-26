import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

// /stats/quiz is for the team only: STATS_TOKEN in the environment is its password. Empty = the page doesn't exist.
export const STATS_TOKEN = process.env.STATS_TOKEN ?? "";
export const STATS_COOKIE = "lbc_stats";

const digest = (s: string) => createHash("sha256").update(s).digest();

export const tokenMatches = (token: string | undefined) => Boolean(STATS_TOKEN && token && timingSafeEqual(digest(token), digest(STATS_TOKEN)));
