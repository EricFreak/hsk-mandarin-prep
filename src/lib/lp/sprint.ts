import type { LpComposition } from "./pricing";
import { EMPTY_COMPOSITION } from "./pricing";

export const SPRINT_MAX_DAYS = 6;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Natural-day difference on ISO dates (YYYY-MM-DD); exam today = 0. */
export function daysUntilExam(todayIso: string, examIso: string): number {
  const today = Date.parse(`${todayIso}T00:00:00Z`);
  const exam = Date.parse(`${examIso}T00:00:00Z`);
  return Math.round((exam - today) / DAY_MS);
}

export function isSprintEligible(todayIso: string, examIso: string | null): boolean {
  if (!examIso) return false;
  const d = daysUntilExam(todayIso, examIso);
  return d >= 0 && d <= SPRINT_MAX_DAYS;
}

export function canUseFreeSprint(freeSprintUsedAt: string | null): boolean {
  return freeSprintUsedAt === null;
}

const DAILY = { vocabulary: 20, grammar: 10, listening: 15, reading: 5 } as const;

export function sprintComposition(days: number): LpComposition {
  const d = Math.max(1, Math.floor(days));
  return {
    ...EMPTY_COMPOSITION,
    vocabulary: DAILY.vocabulary * d,
    grammar: DAILY.grammar * d,
    listening: DAILY.listening * d,
    reading: DAILY.reading * d,
    writingReview: 1,
    mockSection: 1,
  };
}
