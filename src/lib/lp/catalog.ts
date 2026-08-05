// src/lib/lp/catalog.ts
import { RHO_CENTS_PER_LP } from "./pricing";

export type CoachPackId = "coach_4w" | "coach_8w" | "coach_12w";
export type ServiceType = CoachPackId | "exam_custom" | "sprint";

export type CoachPack = {
  id: CoachPackId;
  weeks: 4 | 8 | 12;
  lpBudget: number;
  priceCents: number;
};

/** Pinned budget: 325 LP/week → $13 / $26 / $39 at ρ=1¢. Change here only. */
const LP_BUDGET_PER_WEEK = 325;

export const COACH_PACKS: CoachPack[] = ([4, 8, 12] as const).map((weeks) => {
  const lpBudget = LP_BUDGET_PER_WEEK * weeks;
  return {
    id: `coach_${weeks}w` as CoachPackId,
    weeks,
    lpBudget,
    priceCents: lpBudget * RHO_CENTS_PER_LP,
  };
});

export function getCoachPack(id: string): CoachPack | null {
  return COACH_PACKS.find((p) => p.id === id) ?? null;
}
