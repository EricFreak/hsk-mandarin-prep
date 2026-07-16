import { describe, it, expect } from "vitest";
import {
  SPRINT_MAX_DAYS,
  daysUntilExam,
  isSprintEligible,
  canUseFreeSprint,
  sprintComposition,
} from "@/lib/lp/sprint";
import { computeLpTotal } from "@/lib/lp/pricing";

describe("emergency sprint", () => {
  it("day math: exam today = 0 days", () => {
    expect(daysUntilExam("2026-07-16", "2026-07-16")).toBe(0);
    expect(daysUntilExam("2026-07-16", "2026-07-22")).toBe(6);
  });

  it("eligible only within 0..6 days, exam date required", () => {
    expect(SPRINT_MAX_DAYS).toBe(6);
    expect(isSprintEligible("2026-07-16", "2026-07-16")).toBe(true);
    expect(isSprintEligible("2026-07-16", "2026-07-22")).toBe(true);
    expect(isSprintEligible("2026-07-16", "2026-07-23")).toBe(false);
    expect(isSprintEligible("2026-07-16", "2026-07-15")).toBe(false); // 考期已过
    expect(isSprintEligible("2026-07-16", null)).toBe(false);
  });

  it("lifetime free flag", () => {
    expect(canUseFreeSprint(null)).toBe(true);
    expect(canUseFreeSprint("2026-01-01T00:00:00Z")).toBe(false);
  });

  it("composition scales daily drills, fixed writing+mock; min 1 day", () => {
    const threeDays = sprintComposition(3);
    expect(threeDays).toEqual({
      vocabulary: 60, // 20/day
      grammar: 30, // 10/day
      listening: 45, // 15/day
      reading: 15, // 5/day
      writingReview: 1,
      mockSection: 1,
    });
    expect(sprintComposition(0)).toEqual(sprintComposition(1)); // exam today → 1 day of work
    expect(computeLpTotal(threeDays)).toBe(60 + 30 + 90 + 45 + 100 + 50); // 375 LP → $3.75
  });
});
