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

export function getWeaknessSummary(
  breakdown: WeaknessEntry[],
  plan: Plan,
): WeaknessEntry[] {
  if (plan === "pro") return breakdown;
  return breakdown.slice(0, 1);
}
