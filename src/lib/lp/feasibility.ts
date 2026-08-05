// src/lib/lp/feasibility.ts
import type { LpComposition } from "./pricing";

/** Internal effort model (minutes per unit); calibrate alongside LP_WEIGHTS. */
export const TASK_MINUTES: Record<keyof LpComposition, number> = {
  vocabulary: 0.5,
  grammar: 0.5,
  listening: 1.5,
  reading: 3,
  writingReview: 20,
  mockSection: 30,
};

export const DEFAULT_MINUTES_PER_DAY = 45;

export function estimateMinutes(composition: LpComposition): number {
  return (Object.keys(TASK_MINUTES) as (keyof LpComposition)[]).reduce(
    (sum, key) =>
      sum + Math.max(0, Math.floor(composition[key] ?? 0)) * TASK_MINUTES[key],
    0
  );
}

export type FeasibilityResult = {
  feasible: boolean;
  totalMinutes: number;
  capacityMinutes: number;
  requiredMinutesPerDay: number;
};

export function checkFeasibility(input: {
  composition: LpComposition;
  daysUntilExam: number;
  minutesPerDay?: number;
}): FeasibilityResult {
  const days = Math.max(1, Math.floor(input.daysUntilExam));
  const perDay = input.minutesPerDay ?? DEFAULT_MINUTES_PER_DAY;
  const totalMinutes = estimateMinutes(input.composition);
  const capacityMinutes = days * perDay;
  return {
    feasible: totalMinutes <= capacityMinutes,
    totalMinutes,
    capacityMinutes,
    requiredMinutesPerDay: Math.ceil(totalMinutes / days),
  };
}
