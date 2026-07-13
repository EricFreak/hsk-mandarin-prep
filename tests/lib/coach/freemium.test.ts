import { describe, expect, it } from "vitest";
import {
  applyFreemiumReport,
  applyFreemiumTasks,
  pickTodayTask,
  truncateToFirstParagraph,
} from "@/lib/coach/freemium";
import type { CoachPlanTaskRow, CoachReportRow } from "@/lib/coach/types";

const sampleReport: CoachReportRow = {
  id: "r1",
  user_id: "u1",
  trigger: "mock_exam_completed",
  source_attempt_id: "a1",
  previous_report_id: null,
  readiness_score: 72,
  summary_markdown: "Paragraph one.\n\nParagraph two.",
  strengths: [
    { skill: "vocabulary", evidence: "Strong vocab" },
    { skill: "reading", evidence: "Good reading" },
  ],
  gaps: [
    { skill: "listening", severity: "high", evidence: "3 wrong" },
    { skill: "grammar", severity: "medium", evidence: "2 wrong" },
  ],
  metrics: {},
  model: "deepseek-chat",
  version: 1,
  created_at: "2026-07-10T00:00:00.000Z",
};

describe("coach freemium", () => {
  it("truncates free report to first paragraph and one gap", () => {
    const gated = applyFreemiumReport(sampleReport, "free");
    expect(gated.summary_markdown).toBe("Paragraph one.");
    expect(gated.gaps).toHaveLength(1);
    expect(gated.strengths).toHaveLength(1);
  });

  it("keeps full report for pro", () => {
    const gated = applyFreemiumReport(sampleReport, "pro");
    expect(gated.summary_markdown).toContain("Paragraph two");
    expect(gated.gaps).toHaveLength(2);
  });

  it("passthrough all tasks for free and pro", () => {
    const tasks = Array.from({ length: 7 }, (_, index) => ({
      id: `t`,
      plan_id: "p1",
      user_id: "u1",
      day_offset: index,
      task_type: "practice" as const,
      skill: "listening",
      target_count: 15,
      title: `Task `,
      status: "pending" as const,
      completed_at: null,
    }));
    expect(applyFreemiumTasks(tasks, "free")).toHaveLength(7);
    expect(applyFreemiumTasks(tasks, "pro")).toHaveLength(7);
  });

  it("picks today's pending practice task", () => {
    const weekStart = new Date().toISOString().slice(0, 10);
    const tasks: CoachPlanTaskRow[] = [
      {
        id: "t1",
        plan_id: "p1",
        user_id: "u1",
        day_offset: 0,
        task_type: "practice",
        skill: "listening",
        target_count: 15,
        title: "Listening drills",
        status: "pending",
        completed_at: null,
      },
    ];
    expect(pickTodayTask(tasks, weekStart)?.id).toBe("t1");
  });
});

describe("truncateToFirstParagraph", () => {
  it("returns first paragraph only", () => {
    expect(truncateToFirstParagraph("A\n\nB")).toBe("A");
  });
});
