import { describe, expect, it } from "vitest";
import {
  canExecuteWeek,
  nextWeekAfterClear,
} from "@/lib/coach/journey/week-unlock";

describe("canExecuteWeek", () => {
  it("allows week 1 for free", () => {
    expect(
      canExecuteWeek({ weekIndex: 1, plan: "free", currentWeekIndex: 1 }),
    ).toBe(true);
  });
  it("blocks week 2 for free even if current is 2", () => {
    expect(
      canExecuteWeek({ weekIndex: 2, plan: "free", currentWeekIndex: 2 }),
    ).toBe(false);
  });
  it("allows week 2 for pro when currentWeekIndex is 2", () => {
    expect(
      canExecuteWeek({ weekIndex: 2, plan: "pro", currentWeekIndex: 2 }),
    ).toBe(true);
  });
  it("blocks future week even for pro", () => {
    expect(
      canExecuteWeek({ weekIndex: 3, plan: "pro", currentWeekIndex: 2 }),
    ).toBe(false);
  });
});

describe("nextWeekAfterClear", () => {
  it("increments", () => {
    expect(nextWeekAfterClear(1)).toBe(2);
  });
});
