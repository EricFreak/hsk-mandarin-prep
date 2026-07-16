import { describe, it, expect } from "vitest";
import {
  canExecuteWeek,
  shouldShowQuoteCta,
  nextWeekAfterClear,
} from "@/lib/coach/journey/week-unlock";

describe("canExecuteWeek (access-based)", () => {
  it("paid access executes the current week", () => {
    expect(canExecuteWeek({ weekIndex: 3, currentWeekIndex: 3, access: "paid_order" })).toBe(true);
  });
  it("never executes a non-current week", () => {
    expect(canExecuteWeek({ weekIndex: 2, currentWeekIndex: 3, access: "paid_order" })).toBe(false);
  });
  it("no access → cannot execute any full week (sample day is task-level)", () => {
    expect(canExecuteWeek({ weekIndex: 1, currentWeekIndex: 1, access: null })).toBe(false);
  });
});

describe("shouldShowQuoteCta", () => {
  const doneDay0 = [
    { dayOffset: 0, required: true, status: "done" },
    { dayOffset: 0, required: true, status: "skipped" },
    { dayOffset: 1, required: true, status: "pending" },
  ];
  it("fires when free user finishes the sample day", () => {
    expect(shouldShowQuoteCta({ access: null, sampleDayTasks: doneDay0 })).toBe(true);
  });
  it("silent while sample day incomplete or when user has access", () => {
    expect(
      shouldShowQuoteCta({
        access: null,
        sampleDayTasks: [{ dayOffset: 0, required: true, status: "pending" }],
      })
    ).toBe(false);
    expect(shouldShowQuoteCta({ access: "paid_order", sampleDayTasks: doneDay0 })).toBe(false);
  });
});

describe("nextWeekAfterClear", () => {
  it("advances by one", () => expect(nextWeekAfterClear(2)).toBe(3));
});
