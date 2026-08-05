import { describe, it, expect } from "vitest";
import {
  resolveAccessSource,
  hasFullAccess,
  canExecuteTask,
  selectTasterTaskIds,
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

describe("selectTasterTaskIds", () => {
  it("picks earliest task per taster skill across days", () => {
    const ids = selectTasterTaskIds([
      { id: "v1", skill: "vocabulary", day_offset: 0, task_type: "practice" },
      { id: "l1", skill: "listening", day_offset: 1, task_type: "practice" },
      { id: "g1", skill: "grammar", day_offset: 2, task_type: "practice" },
      { id: "w1", skill: "writing", day_offset: 3, task_type: "practice" },
      { id: "l2", skill: "listening", day_offset: 4, task_type: "practice" },
    ]);
    expect(Array.from(ids).sort()).toEqual(["g1", "l1", "v1", "w1"]);
  });

  it("falls back to day 0 when no skill tags", () => {
    const ids = selectTasterTaskIds([
      { id: "d0", skill: null, day_offset: 0, task_type: "practice" },
      { id: "d1", skill: null, day_offset: 1, task_type: "practice" },
    ]);
    expect(Array.from(ids)).toEqual(["d0"]);
  });
});

describe("task-level gate (sample taste)", () => {
  const taster = new Set(["taster-a", "taster-b"]);

  it("any access source executes everything", () => {
    expect(
      canExecuteTask({
        access: "legacy_pro",
        weekIndex: 5,
        taskId: "x",
        tasterTaskIds: taster,
      }),
    ).toBe(true);
    expect(
      canExecuteTask({
        access: "free_sprint",
        weekIndex: 1,
        taskId: "x",
        tasterTaskIds: taster,
      }),
    ).toBe(true);
  });

  it("no access → only week 1 taster task ids", () => {
    expect(
      canExecuteTask({
        access: null,
        weekIndex: 1,
        taskId: "taster-a",
        tasterTaskIds: taster,
      }),
    ).toBe(true);
    expect(
      canExecuteTask({
        access: null,
        weekIndex: 1,
        taskId: "locked",
        tasterTaskIds: taster,
      }),
    ).toBe(false);
    expect(
      canExecuteTask({
        access: null,
        weekIndex: 2,
        taskId: "taster-a",
        tasterTaskIds: taster,
      }),
    ).toBe(false);
  });
});
