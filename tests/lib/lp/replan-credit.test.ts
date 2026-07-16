import { describe, it, expect } from "vitest";
import {
  compositionFromDoneTasks,
  computeUnspentLp,
  applyCredit,
} from "@/lib/lp/replan-credit";
import { EMPTY_COMPOSITION } from "@/lib/lp/pricing";

const done = (row: Partial<Parameters<typeof compositionFromDoneTasks>[0][number]>) => ({
  task_type: "practice",
  skill: "vocabulary",
  target_count: 10,
  status: "done",
  ...row,
});

describe("replan credit", () => {
  it("maps done coach_plan_tasks rows onto LP composition", () => {
    expect(
      compositionFromDoneTasks([
        done({}),                                            // vocabulary 10
        done({ skill: "listening", target_count: 5 }),       // listening 5
        done({ task_type: "flashcards", skill: null, target_count: 20 }), // → vocabulary 20
        done({ task_type: "review_mistakes", skill: null, target_count: 8 }), // → grammar 8
        done({ task_type: "mock_section", skill: null, target_count: null }), // → mockSection 1
        done({ skill: "writing", target_count: 2 }),          // → writingReview 2
        done({ status: "pending" }),                          // ignored
        done({ task_type: "rest", skill: null }),             // ignored
      ])
    ).toEqual({
      ...EMPTY_COMPOSITION,
      vocabulary: 30,
      grammar: 8,
      listening: 5,
      writingReview: 2,
      mockSection: 1,
    });
  });

  it("unspent = order lp_total − consumed, floored at 0", () => {
    const rows = [done({ skill: "writing", target_count: 1 })]; // 100 LP consumed
    expect(computeUnspentLp({ lp_total: 400 }, rows)).toBe(300);
    expect(computeUnspentLp({ lp_total: 50 }, rows)).toBe(0);
  });

  it("credit reduces price, never below zero; lpTotal of new plan unchanged", () => {
    expect(applyCredit({ lpTotal: 500, priceCents: 500 }, 300)).toEqual({
      lpTotal: 500,
      priceCents: 200,
    });
    expect(applyCredit({ lpTotal: 200, priceCents: 200 }, 999)).toEqual({
      lpTotal: 200,
      priceCents: 0,
    });
  });
});
