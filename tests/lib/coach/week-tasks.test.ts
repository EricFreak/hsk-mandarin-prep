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

  it("surfaces cross-skill taster tasks before locked previews for free users", () => {
    const tasks = [
      task({ id: "locked-listen-2", title: "Listening day 2", skill: "listening", day_offset: 2 }),
      task({ id: "locked-extra", title: "Reading", skill: "reading", day_offset: 4 }),
      task({ id: "vocab", title: "Vocab day 0", skill: "vocabulary", day_offset: 0 }),
      task({ id: "listen", title: "Listening day 1", skill: "listening", day_offset: 1 }),
      task({ id: "grammar", title: "Grammar day 3", skill: "grammar", day_offset: 3 }),
      task({ id: "writing", title: "Writing day 5", skill: "writing", day_offset: 5 }),
    ];

    const result = gateOrderedWeekTasks(
      tasks,
      "listening",
      { weekIndex: 1, currentWeekIndex: 1 },
      { access: null },
    );
    // Taster = vocab, listen, grammar, writing; reading locked. Listening gap ordered first among pending.
    expect(result.tasks.slice(0, 4).map((t) => t.id).sort()).toEqual(
      ["grammar", "listen", "vocab", "writing"].sort(),
    );
    expect(result.tasks[result.tasks.length - 1].id).toBe("locked-extra");
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
  it("puts unlocked taster tasks first while preserving relative order", () => {
    const tasks = [
      task({ id: "locked-a", title: "Listening day 2", skill: "listening", day_offset: 2 }),
      task({ id: "unlocked", title: "Listening day 1", skill: "listening", day_offset: 1 }),
      task({ id: "locked-b", title: "Reading", skill: "reading", day_offset: 0 }),
    ];
    const tasterTaskIds = new Set(["unlocked"]);
    const partitioned = partitionTasksByExecutability(tasks, {
      access: null,
      weekIndex: 1,
      tasterTaskIds,
    });
    expect(partitioned.map((t) => t.id)).toEqual(["unlocked", "locked-a", "locked-b"]);
  });

  it("preserves order for paid users", () => {
    const partitioned = partitionTasksByExecutability(fourTasks, {
      access: "legacy_pro",
      weekIndex: 3,
      tasterTaskIds: new Set(),
    });
    expect(partitioned.map((t) => t.id)).toEqual(fourTasks.map((t) => t.id));
  });
});
