import type { Plan } from "@/lib/entitlements";

export type WeaknessEntry = {
  skill: string;
  wrongCount: number;
};

export type AttemptResult = {
  skill: string;
  correct: boolean;
};

export function computeWeaknesses(attempts: AttemptResult[]): WeaknessEntry[] {
  const wrongBySkill = new Map<string, number>();

  for (const attempt of attempts) {
    if (attempt.correct) continue;
    wrongBySkill.set(attempt.skill, (wrongBySkill.get(attempt.skill) ?? 0) + 1);
  }

  return Array.from(wrongBySkill.entries())
    .map(([skill, wrongCount]) => ({ skill, wrongCount }))
    .sort((a, b) => b.wrongCount - a.wrongCount);
}

/**
 * Full breakdown for full-access users (paid order, free sprint, or legacy
 * pro); free users see only their top weakness. `plan` is kept for the legacy
 * pro path — under the LP model a paying customer has plan='free' with access
 * from lp_orders, so the `fullAccess` flag is what actually drives truncation.
 */
export function getWeaknessSummary(
  breakdown: WeaknessEntry[],
  plan: Plan,
  fullAccess: boolean,
): WeaknessEntry[] {
  if (plan === "pro" || fullAccess) return breakdown;
  return breakdown.slice(0, 1);
}
