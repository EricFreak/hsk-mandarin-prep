import type { Plan } from "@/lib/entitlements";

export type AccessSource = "paid_order" | "free_sprint" | "legacy_pro";

export function resolveAccessSource(input: {
  plan: Plan;
  activePaidOrder: { priceCents: number } | null;
}): AccessSource | null {
  if (input.activePaidOrder) {
    return input.activePaidOrder.priceCents === 0 ? "free_sprint" : "paid_order";
  }
  if (input.plan === "pro") return "legacy_pro"; // grandfathered subscribers
  return null;
}

export function hasFullAccess(source: AccessSource | null): boolean {
  return source !== null;
}

/** Free users get exactly the sample day: week 1, day_offset 0. */
export function canExecuteTask(input: {
  access: AccessSource | null;
  weekIndex: number;
  dayOffset: number;
}): boolean {
  if (input.access) return true;
  return input.weekIndex === 1 && input.dayOffset === 0;
}
