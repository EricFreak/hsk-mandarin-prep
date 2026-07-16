import { describe, it, expect } from "vitest";
import {
  resolveAccessSource,
  hasFullAccess,
  canExecuteTask,
} from "@/lib/lp/access";

describe("access resolution", () => {
  it("paid order wins; zero-price paid order = free sprint", () => {
    expect(
      resolveAccessSource({ plan: "free", activePaidOrder: { priceCents: 1300 } })
    ).toBe("paid_order");
    expect(
      resolveAccessSource({ plan: "free", activePaidOrder: { priceCents: 0 } })
    ).toBe("free_sprint");
  });

  it("legacy pro is grandfathered", () => {
    expect(resolveAccessSource({ plan: "pro", activePaidOrder: null })).toBe("legacy_pro");
  });

  it("free without order has no access", () => {
    expect(resolveAccessSource({ plan: "free", activePaidOrder: null })).toBeNull();
    expect(hasFullAccess(null)).toBe(false);
    expect(hasFullAccess("paid_order")).toBe(true);
  });
});

describe("task-level gate (sample day)", () => {
  it("any access source executes everything", () => {
    expect(canExecuteTask({ access: "legacy_pro", weekIndex: 5, dayOffset: 3 })).toBe(true);
    expect(canExecuteTask({ access: "free_sprint", weekIndex: 1, dayOffset: 2 })).toBe(true);
  });

  it("no access → only week 1 day 0 (the free sample day)", () => {
    expect(canExecuteTask({ access: null, weekIndex: 1, dayOffset: 0 })).toBe(true);
    expect(canExecuteTask({ access: null, weekIndex: 1, dayOffset: 1 })).toBe(false);
    expect(canExecuteTask({ access: null, weekIndex: 2, dayOffset: 0 })).toBe(false);
  });
});
