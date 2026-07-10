import { describe, expect, it } from "vitest";
import { parsePlanResponse, parseReportResponse } from "@/lib/coach/schemas";

describe("coach schemas", () => {
  it("parses a valid report response", () => {
    const parsed = parseReportResponse({
      readinessScore: 68,
      summaryMarkdown: "You are making progress.",
      strengths: [{ skill: "vocabulary", evidence: "85% accuracy" }],
      gaps: [{ skill: "listening", severity: "high", evidence: "3 incorrect" }],
      metrics: { latestMockScore: 68 },
    });

    expect(parsed.readinessScore).toBe(68);
    expect(parsed.gaps[0].skill).toBe("listening");
  });

  it("parses a valid plan response", () => {
    const parsed = parsePlanResponse({
      focusSkills: ["listening", "grammar"],
      tasks: [
        {
          dayOffset: 0,
          taskType: "practice",
          skill: "listening",
          targetCount: 15,
          title: "Listening drills",
        },
        {
          dayOffset: 1,
          taskType: "rest",
          skill: null,
          targetCount: null,
          title: "Rest day",
        },
        {
          dayOffset: 2,
          taskType: "flashcards",
          skill: "vocabulary",
          targetCount: 20,
          title: "Vocabulary review",
        },
      ],
    });

    expect(parsed.focusSkills).toEqual(["listening", "grammar"]);
    expect(parsed.tasks).toHaveLength(3);
  });
});
