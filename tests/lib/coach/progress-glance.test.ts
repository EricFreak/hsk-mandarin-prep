import { describe, expect, it } from "vitest";
import {
  readinessDelta,
  skillDirectionChips,
  type GlanceReport,
} from "@/lib/coach/progress-glance";

const base = (over: Partial<GlanceReport> & Pick<GlanceReport, "id">): GlanceReport => ({
  readiness_score: 60,
  gaps: [],
  strengths: [],
  ...over,
});

describe("readinessDelta", () => {
  it("returns null when previous missing", () => {
    expect(readinessDelta(base({ id: "a", readiness_score: 70 }), null)).toBeNull();
  });

  it("returns current - previous", () => {
    expect(
      readinessDelta(
        base({ id: "a", readiness_score: 70 }),
        base({ id: "b", readiness_score: 62 }),
      ),
    ).toBe(8);
  });
});

describe("skillDirectionChips", () => {
  it("marks gap skill as down vs previous strength", () => {
    const chips = skillDirectionChips(
      base({
        id: "a",
        gaps: [{ skill: "listening", severity: "high", evidence: "x" }],
        strengths: [{ skill: "reading", evidence: "y" }],
      }),
      base({
        id: "b",
        gaps: [{ skill: "reading", severity: "medium", evidence: "z" }],
        strengths: [{ skill: "listening", evidence: "w" }],
      }),
      4,
    );
    expect(chips.find((c) => c.skill === "listening")?.direction).toBe("down");
    expect(chips.find((c) => c.skill === "reading")?.direction).toBe("up");
  });

  it("limits chip count", () => {
    const chips = skillDirectionChips(
      base({
        id: "a",
        gaps: [
          { skill: "listening", severity: "high", evidence: "a" },
          { skill: "reading", severity: "high", evidence: "b" },
          { skill: "writing", severity: "medium", evidence: "c" },
          { skill: "grammar", severity: "low", evidence: "d" },
        ],
        strengths: [],
      }),
      null,
      3,
    );
    expect(chips).toHaveLength(3);
  });
});
