import { describe, expect, it } from "vitest";
import { allocateStages } from "@/lib/coach/journey/allocate-stages";
import { buildWeekOutline } from "@/lib/coach/journey/build-outline";

describe("buildWeekOutline", () => {
  it("covers every calendar week until exam with theme-level rows", () => {
    const stages = allocateStages({ today: "2026-07-13", examDate: "2026-09-07" });
    const outline = buildWeekOutline({
      stages,
      today: "2026-07-13",
      gaps: [{ skill: "listening", severity: "high" }],
    });
    expect(outline.length).toBeGreaterThanOrEqual(6);
    expect(outline[0]).toMatchObject({
      weekIndex: 1,
      status: "available",
    });
    expect(outline[1]?.status).toBe("locked");
    expect(outline.every((w) => w.theme.length > 0)).toBe(true);
  });

  it("labels foundation weeks vocab/grammar-led", () => {
    const stages = allocateStages({ today: "2026-07-13", examDate: "2026-11-01" });
    const outline = buildWeekOutline({ stages, today: "2026-07-13", gaps: [] });
    const foundation = outline.filter((w) => w.stage === "foundation");
    expect(foundation[0]?.theme.toLowerCase()).toMatch(/vocab|grammar|foundation/);
  });
});
