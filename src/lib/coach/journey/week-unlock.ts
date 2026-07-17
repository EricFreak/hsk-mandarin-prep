import type { AccessSource } from "@/lib/lp/access";

export function canExecuteWeek(input: {
  weekIndex: number;
  currentWeekIndex: number;
  access: AccessSource | null;
}): boolean {
  if (input.weekIndex !== input.currentWeekIndex) return false;
  return input.access !== null;
}

/** Conversion CTA after the free cross-skill sample taste is finished. */
export function shouldShowQuoteCta(input: {
  access: AccessSource | null;
  tasterTasks: { required: boolean; status: string }[];
}): boolean {
  if (input.access) return false;
  const required = input.tasterTasks.filter((t) => t.required);
  if (required.length === 0) return false;
  return required.every((t) => t.status === "done" || t.status === "skipped");
}

export function nextWeekAfterClear(currentWeekIndex: number): number {
  return currentWeekIndex + 1;
}
