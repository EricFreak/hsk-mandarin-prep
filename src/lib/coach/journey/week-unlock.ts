import type { Plan } from "@/lib/entitlements";

export function canExecuteWeek(input: {
  weekIndex: number;
  currentWeekIndex: number;
  plan: Plan;
  w1ClearedAt?: string | null;
}): boolean {
  if (input.weekIndex !== input.currentWeekIndex) return false;
  if (input.plan === "free" && input.weekIndex > 1) return false;
  // Free users who cleared W1 stay parked for conversion (W2 exec locked).
  if (input.plan === "free" && input.weekIndex === 1 && input.w1ClearedAt) {
    return false;
  }
  return true;
}

export function nextWeekAfterClear(currentWeekIndex: number): number {
  return currentWeekIndex + 1;
}

export function shouldShowWeek1ProCta(input: {
  plan: Plan;
  currentWeekIndex: number;
  weekCleared: boolean;
  w1ClearedAt?: string | null;
}): boolean {
  if (input.plan !== "free") return false;
  if (input.w1ClearedAt) return true;
  return input.currentWeekIndex === 1 && input.weekCleared;
}
