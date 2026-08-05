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
  it("no access → cannot execute any full week (sample taste is task-level)", () => {
    expect(canExecuteWeek({ weekIndex: 1, currentWeekIndex: 1, access: null })).toBe(false);
  });
});

describe("shouldShowQuoteCta", () => {
  const doneTaster = [
    { required: true, status: "done" },
    { required: true, status: "skipped" },
  ];
  it("fires when free user finishes the taster set", () => {
    expect(shouldShowQuoteCta({ access: null, tasterTasks: doneTaster })).toBe(true);
  });
  it("silent while taster incomplete or when user has access", () => {
    expect(
      shouldShowQuoteCta({
        access: null,
        tasterTasks: [{ required: true, status: "pending" }],
      }),
    ).toBe(false);
    expect(shouldShowQuoteCta({ access: "paid_order", tasterTasks: doneTaster })).toBe(false);
  });
});

describe("nextWeekAfterClear", () => {
  it("advances by one", () => expect(nextWeekAfterClear(2)).toBe(3));
});
