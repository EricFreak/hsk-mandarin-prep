export type Plan = "free" | "pro";

export const FREE_DAILY_PRACTICE_LIMIT = 20;
export const FREE_MOCK_EXAM_LIMIT = 1;

export function canStartPractice(
  plan: Plan,
  fullAccess: boolean,
  questionsAnsweredToday: number,
): boolean {
  if (plan === "pro" || fullAccess) return true;
  return questionsAnsweredToday < FREE_DAILY_PRACTICE_LIMIT;
}

export function canTakeMockExam(
  plan: Plan,
  fullAccess: boolean,
  mockExamsCompleted: number,
): boolean {
  if (plan === "pro" || fullAccess) return true;
  return mockExamsCompleted < FREE_MOCK_EXAM_LIMIT;
}

export function canViewWeaknessDetail(_plan: Plan): boolean {
  void _plan;
  return true;
}

export function planLabel(plan: Plan): string {
  return plan === "pro" ? "Pro" : "Free";
}
