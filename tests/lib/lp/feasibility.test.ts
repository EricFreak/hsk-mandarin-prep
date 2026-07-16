// tests/lib/lp/feasibility.test.ts
import { describe, it, expect } from "vitest";
import { EMPTY_COMPOSITION } from "@/lib/lp/pricing";
import {
  TASK_MINUTES,
  DEFAULT_MINUTES_PER_DAY,
  estimateMinutes,
  checkFeasibility,
} from "@/lib/lp/feasibility";

describe("exam-custom feasibility", () => {
  it("uses pinned per-task minute estimates", () => {
    expect(TASK_MINUTES).toEqual({
      vocabulary: 0.5,
      grammar: 0.5,
      listening: 1.5,
      reading: 3,
      writingReview: 20,
      mockSection: 30,
    });
    expect(DEFAULT_MINUTES_PER_DAY).toBe(45);
  });

  it("estimates total minutes", () => {
    expect(
      estimateMinutes({ ...EMPTY_COMPOSITION, vocabulary: 20, writingReview: 2 })
    ).toBe(50); // 10 + 40
  });

  it("passes when workload fits the window", () => {
    const r = checkFeasibility({
      composition: { ...EMPTY_COMPOSITION, vocabulary: 100, listening: 40 }, // 50+60=110min
      daysUntilExam: 7,
    });
    expect(r.feasible).toBe(true);
    expect(r.capacityMinutes).toBe(7 * 45);
    expect(r.requiredMinutesPerDay).toBe(16); // ceil(110/7)
  });

  it("fails when overloaded and reports required pace (no silent trimming)", () => {
    const r = checkFeasibility({
      composition: { ...EMPTY_COMPOSITION, writingReview: 30 }, // 600min
      daysUntilExam: 3,
      minutesPerDay: 60,
    });
    expect(r.feasible).toBe(false);
    expect(r.totalMinutes).toBe(600);
    expect(r.requiredMinutesPerDay).toBe(200);
  });
});
