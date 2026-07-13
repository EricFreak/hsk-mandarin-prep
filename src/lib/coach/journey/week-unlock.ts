import type { Plan } from "@/lib/entitlements";

export function canExecuteWeek(input: {
  weekIndex: number;
  currentWeekIndex: number;
  plan: Plan;
}): boolean {
  if (input.weekIndex !== input.currentWeekIndex) return false;
  if (input.plan === "free" && input.weekIndex > 1) return false;
  return true;
}

export function nextWeekAfterClear(currentWeekIndex: number): number {
  return currentWeekIndex + 1;
}

export function shouldShowWeek1ProCta(input: {
  plan: Plan;
  currentWeekIndex: number;
  weekCleared: boolean;
}): boolean {
  return input.plan === "free" && input.currentWeekIndex === 1 && input.weekCleared;
}
