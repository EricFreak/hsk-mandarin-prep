import type { AccessSource } from "@/lib/lp/access";

export function canExecuteWeek(input: {
  weekIndex: number;
  currentWeekIndex: number;
  access: AccessSource | null;
}): boolean {
  if (input.weekIndex !== input.currentWeekIndex) return false;
  return input.access !== null;
}

/** Conversion moment moved to quote confirmation: CTA after the free sample day. */
export function shouldShowQuoteCta(input: {
  access: AccessSource | null;
  sampleDayTasks: { dayOffset: number; required: boolean; status: string }[];
}): boolean {
  if (input.access) return false;
  const day0 = input.sampleDayTasks.filter((t) => t.dayOffset === 0 && t.required);
  if (day0.length === 0) return false;
  return day0.every((t) => t.status === "done" || t.status === "skipped");
}

export function nextWeekAfterClear(currentWeekIndex: number): number {
  return currentWeekIndex + 1;
}
