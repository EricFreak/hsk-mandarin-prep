import { describe, expect, it } from "vitest";
import { gateOrderedWeekTasks, orderWeekTasks } from "@/lib/coach/week-tasks";
import type { CoachPlanTaskRow } from "@/lib/coach/types";

function task(
  over: Partial<CoachPlanTaskRow> & Pick<CoachPlanTaskRow, "id" | "title">,
): CoachPlanTaskRow {
  return {
    plan_id: "p",
    user_id: "u",
    day_offset: 0,
    task_type: "practice",
    skill: null,
    target_count: null,
    status: "pending",
    completed_at: null,
    ...over,
  };
}

const fourTasks = [
  task({ id: "1", title: "Reading A", skill: "reading", day_offset: 0 }),
  task({ id: "2", title: "Reading B", skill: "reading", day_offset: 1 }),
  task({ id: "3", title: "Reading C", skill: "reading", day_offset: 2 }),
  task({ id: "4", title: "Listening", skill: "listening", day_offset: 3 }),
];

describe("orderWeekTasks", () => {
  it("puts top-gap pending tasks before other pending", () => {
    const ordered = orderWeekTasks(
      [
        task({ id: "1", title: "Reading", skill: "reading", day_offset: 0 }),
        task({ id: "2", title: "Listening", skill: "listening", day_offset: 2 }),
      ],
      "listening",
    );
    expect(ordered.map((t) => t.id)).toEqual(["2", "1"]);
  });

  it("puts done tasks last", () => {
    const ordered = orderWeekTasks(
      [
        task({ id: "1", title: "Done listening", skill: "listening", status: "done" }),
        task({ id: "2", title: "Pending reading", skill: "reading", day_offset: 1 }),
      ],
      "listening",
    );
    expect(ordered.map((t) => t.id)).toEqual(["2", "1"]);
  });
});

describe("gateOrderedWeekTasks", () => {
  it("locks a non-current week", () => {
    const result = gateOrderedWeekTasks(fourTasks, "listening", {
      weekIndex: 2,
      currentWeekIndex: 3,
    });
    expect(result.executionLocked).toBe(true);
    expect(result.tasks).toHaveLength(0);
    expect(result.hiddenTaskCount).toBe(4);
  });

  it("shows all tasks for the current week", () => {
    const result = gateOrderedWeekTasks(fourTasks, "listening", {
      weekIndex: 1,
      currentWeekIndex: 1,
    });
    expect(result.executionLocked).toBe(false);
    expect(result.tasks).toHaveLength(4);
    expect(result.hiddenTaskCount).toBe(0);
  });

  it("shows all tasks when no journey context is provided", () => {
    const result = gateOrderedWeekTasks(fourTasks, "listening");
    expect(result.executionLocked).toBe(false);
    expect(result.tasks).toHaveLength(4);
  });
});
