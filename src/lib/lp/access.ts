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

// Re-export sample taste gate so existing `@/lib/lp/access` imports keep working.
export {
  canExecuteTask,
  selectTasterTaskIds,
  TASTER_SKILLS,
  type TasterTaskLike,
} from "./sample-taste";
