import { describe, expect, it } from "vitest";
import {
  canExecuteWeek,
  nextWeekAfterClear,
  shouldShowWeek1ProCta,
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
  it("blocks Free W1 after cleared (conversion park)", () => {
    expect(
      canExecuteWeek({
        weekIndex: 1,
        plan: "free",
        currentWeekIndex: 1,
        w1ClearedAt: "2026-07-14T03:00:00.000Z",
      }),
    ).toBe(false);
  });
});

describe("nextWeekAfterClear", () => {
  it("increments", () => {
    expect(nextWeekAfterClear(1)).toBe(2);
  });
});

describe("shouldShowWeek1ProCta", () => {
  it("shows for Free when W1 cleared stamp is set", () => {
    expect(
      shouldShowWeek1ProCta({
        plan: "free",
        currentWeekIndex: 1,
        weekCleared: true,
        w1ClearedAt: "2026-07-14T03:00:00.000Z",
      }),
    ).toBe(true);
  });

  it("shows for Free when weekCleared and still on week 1", () => {
    expect(
      shouldShowWeek1ProCta({
        plan: "free",
        currentWeekIndex: 1,
        weekCleared: true,
      }),
    ).toBe(true);
  });

  it("hides for Pro", () => {
    expect(
      shouldShowWeek1ProCta({
        plan: "pro",
        currentWeekIndex: 1,
        weekCleared: true,
        w1ClearedAt: "2026-07-14T03:00:00.000Z",
      }),
    ).toBe(false);
  });
});
