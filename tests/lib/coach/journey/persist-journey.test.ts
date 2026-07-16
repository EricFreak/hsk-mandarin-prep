import { describe, expect, it } from "vitest";
import {
  ensureJourney,
  isTaskCleared,
  isWeekCleared,
  type PlanTaskForClearance,
} from "@/lib/coach/journey/persist-journey";

function task(overrides: Partial<PlanTaskForClearance>): PlanTaskForClearance {
  return {
    task_type: "practice",
    status: "pending",
    ...overrides,
  };
}

type StubProfile = {
  service_intent?: string | null;
  target_exam_date?: string | null;
  journey_horizon_weeks?: number | null;
  current_week_index?: number | null;
  current_stage?: string | null;
  stage_calendar?: unknown;
  journey_started_at?: string | null;
};

function baseProfile(overrides: Partial<StubProfile> = {}): StubProfile {
  return {
    service_intent: "coach",
    target_exam_date: null,
    journey_horizon_weeks: 12,
    current_week_index: null,
    current_stage: null,
    stage_calendar: {},
    journey_started_at: null,
    ...overrides,
  };
}

/** Chainable thenable supabase stub: returns the given profile for the
 *  learner_profiles maybeSingle() read, empty outlines (forces init), and
 *  succeeds on upsert/update. Mirrors the style in fulfill-order.test.ts. */
function stubClient(profile: StubProfile) {
  const from = (table: string) => {
    const state: { update?: Record<string, unknown> } = {};
    const chain: any = {
      select: () => chain,
      order: () => chain,
      upsert: () => chain,
      update: (values: Record<string, unknown>) => {
        state.update = values;
        return chain;
      },
      eq: () => chain,
      maybeSingle: async () => ({
        data: table === "learner_profiles" ? profile : null,
        error: null,
      }),
      then: (resolve: (v: unknown) => void) => {
        if (state.update) {
          resolve({ data: null, error: null });
        } else if (table === "journey_week_outlines") {
          resolve({ data: [], error: null });
        } else {
          resolve({ data: null, error: null });
        }
      },
    };
    return chain;
  };
  return { from } as any;
}

describe("isTaskCleared", () => {
  it("passes when mastery_status is passed", () => {
    expect(isTaskCleared(task({ mastery_status: "passed" }))).toBe(true);
  });

  it("passes when mastery_status is challenged", () => {
    expect(isTaskCleared(task({ mastery_status: "challenged" }))).toBe(true);
  });

  it("falls back to status done when mastery_status is missing", () => {
    expect(isTaskCleared(task({ status: "done" }))).toBe(true);
  });

  it("auto-passes rest tasks when marked done", () => {
    expect(
      isTaskCleared(task({ task_type: "rest", status: "done" })),
    ).toBe(true);
  });

  it("skips optional tasks", () => {
    expect(
      isTaskCleared(task({ required: false, status: "pending" })),
    ).toBe(true);
  });

  it("fails pending practice without mastery", () => {
    expect(isTaskCleared(task({ status: "pending" }))).toBe(false);
  });
});

describe("isWeekCleared", () => {
  it("returns false when no required tasks exist", () => {
    expect(isWeekCleared([])).toBe(false);
  });

  it("returns true when all required tasks are cleared", () => {
    const tasks = [
      task({ status: "done" }),
      task({ task_type: "rest", status: "done" }),
      task({ required: false, status: "pending" }),
    ];
    expect(isWeekCleared(tasks)).toBe(true);
  });

  it("returns false when any required task is incomplete", () => {
    const tasks = [
      task({ status: "done" }),
      task({ status: "pending" }),
    ];
    expect(isWeekCleared(tasks)).toBe(false);
  });
});

describe("ensureJourney sprint branch", () => {
  it("builds a single sprint window when service_intent=sprint and exam within 6 days", async () => {
    const profile = baseProfile({
      service_intent: "sprint",
      target_exam_date: "2026-07-19", // today stub = 2026-07-16
      stage_calendar: {},
    });
    const result = await ensureJourney(stubClient(profile), "u1", {
      gaps: [],
      today: "2026-07-16",
    });
    expect(result.stageCalendar).toEqual([
      { stage: "sprint", startDate: "2026-07-16", endDate: "2026-07-19" },
    ]);
    expect(result.outline).toHaveLength(1);
    expect(result.outline[0]).toMatchObject({
      weekIndex: 1,
      stage: "sprint",
      status: "available",
    });
  });
});
