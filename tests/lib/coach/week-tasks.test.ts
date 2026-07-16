import { describe, expect, it } from "vitest";
import {
  gateOrderedWeekTasks,
  orderWeekTasks,
  partitionTasksByExecutability,
} from "@/lib/coach/week-tasks";
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

  it("surfaces executable sample-day task before locked previews for free users", () => {
    const tasks = [
      task({ id: "locked-a", title: "Listening day 1", skill: "listening", day_offset: 1 }),
      task({ id: "locked-b", title: "Listening day 2", skill: "listening", day_offset: 2 }),
      task({ id: "sample", title: "Reading day 0", skill: "reading", day_offset: 0 }),
    ];
    const withoutPartition = orderWeekTasks(tasks, "listening");
    expect(withoutPartition.map((t) => t.id)).toEqual(["locked-a", "locked-b", "sample"]);

    const result = gateOrderedWeekTasks(
      tasks,
      "listening",
      { weekIndex: 1, currentWeekIndex: 1 },
      { access: null },
    );
    expect(result.tasks.map((t) => t.id)).toEqual(["sample", "locked-a", "locked-b"]);
  });

  it("leaves paid-user ordering unchanged", () => {
    const ordered = orderWeekTasks(fourTasks, "listening");
    const result = gateOrderedWeekTasks(
      fourTasks,
      "listening",
      { weekIndex: 1, currentWeekIndex: 1 },
      { access: "paid_order" },
    );
    expect(result.tasks.map((t) => t.id)).toEqual(ordered.map((t) => t.id));
  });
});

describe("partitionTasksByExecutability", () => {
  it("puts unlocked tasks first while preserving relative order", () => {
    const tasks = [
      task({ id: "locked-a", title: "Listening day 1", skill: "listening", day_offset: 1 }),
      task({ id: "unlocked", title: "Reading day 0", skill: "reading", day_offset: 0 }),
      task({ id: "locked-b", title: "Listening day 2", skill: "listening", day_offset: 2 }),
    ];
    const partitioned = partitionTasksByExecutability(tasks, {
      access: null,
      weekIndex: 1,
    });
    expect(partitioned.map((t) => t.id)).toEqual(["unlocked", "locked-a", "locked-b"]);
  });

  it("preserves order for paid users", () => {
    const partitioned = partitionTasksByExecutability(fourTasks, {
      access: "legacy_pro",
      weekIndex: 3,
    });
    expect(partitioned.map((t) => t.id)).toEqual(fourTasks.map((t) => t.id));
  });
});
