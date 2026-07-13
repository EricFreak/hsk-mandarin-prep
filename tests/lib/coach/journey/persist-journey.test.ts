import { describe, expect, it } from "vitest";
import {
  isTaskCleared,
  isWeekCleared,
  type PlanTaskForClearance,
} from "@/lib/coach/journey/persist-journey";

function task(overrides: Partial<PlanTaskForClearance>): PlanTaskForClearance {
  return {
    task_type: "practice",
    status: "pending",
    ...overrides,
  };
}

describe("isTaskCleared", () => {
  it("passes when mastery_status is passed", () => {
    expect(isTaskCleared(task({ mastery_status: "passed" }))).toBe(true);
  });

  it("passes when mastery_status is challenged", () => {
    expect(isTaskCleared(task({ mastery_status: "challenged" }))).toBe(true);
  });

  it("falls back to status done when mastery_status is missing", () => {
    expect(isTaskCleared(task({ status: "done" }))).toBe(true);
  });

  it("auto-passes rest tasks when marked done", () => {
    expect(
      isTaskCleared(task({ task_type: "rest", status: "done" })),
    ).toBe(true);
  });

  it("skips optional tasks", () => {
    expect(
      isTaskCleared(task({ required: false, status: "pending" })),
    ).toBe(true);
  });

  it("fails pending practice without mastery", () => {
    expect(isTaskCleared(task({ status: "pending" }))).toBe(false);
  });
});

describe("isWeekCleared", () => {
  it("returns false when no required tasks exist", () => {
    expect(isWeekCleared([])).toBe(false);
  });

  it("returns true when all required tasks are cleared", () => {
    const tasks = [
      task({ status: "done" }),
      task({ task_type: "rest", status: "done" }),
      task({ required: false, status: "pending" }),
    ];
    expect(isWeekCleared(tasks)).toBe(true);
  });

  it("returns false when any required task is incomplete", () => {
    const tasks = [
      task({ status: "done" }),
      task({ status: "pending" }),
    ];
    expect(isWeekCleared(tasks)).toBe(false);
  });
});
