import { describe, expect, it } from "vitest";
import { allocateStages } from "@/lib/coach/journey/allocate-stages";

describe("allocateStages", () => {
  it("is deterministic for same inputs", () => {
    const a = allocateStages({ today: "2026-07-13", examDate: "2026-10-12" });
    const b = allocateStages({ today: "2026-07-13", examDate: "2026-10-12" });
    expect(a).toEqual(b);
  });

  it("ends with sprint before exam when horizon is long", () => {
    const stages = allocateStages({ today: "2026-07-13", examDate: "2026-10-12" });
    expect(stages.map((s) => s.stage)).toEqual([
      "diagnose",
      "foundation",
      "skills",
      "sprint",
    ]);
    const sprint = stages.find((s) => s.stage === "sprint")!;
    expect(sprint.endDate <= "2026-10-12").toBe(true);
    expect(sprint.startDate < sprint.endDate).toBe(true);
  });

  it("uses default horizon weeks when examDate null", () => {
    const stages = allocateStages({
      today: "2026-07-13",
      examDate: null,
      defaultHorizonWeeks: 12,
    });
    expect(stages.at(-1)!.stage).toBe("sprint");
    expect(stages[0]!.stage).toBe("diagnose");
  });

  it("compresses foundation when only ~6 weeks remain", () => {
    const long = allocateStages({ today: "2026-07-13", examDate: "2026-12-01" });
    const short = allocateStages({ today: "2026-07-13", examDate: "2026-08-24" });
    const longF = long.find((s) => s.stage === "foundation")!;
    const shortF = short.find((s) => s.stage === "foundation")!;
    const days = (s: { startDate: string; endDate: string }) =>
      (Date.parse(s.endDate) - Date.parse(s.startDate)) / 86400000;
    expect(days(shortF)).toBeLessThan(days(longF));
  });
});
