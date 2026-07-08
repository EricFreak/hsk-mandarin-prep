import { describe, it, expect } from "vitest";
import { computeWeaknesses, getWeaknessSummary } from "@/lib/weakness";

describe("computeWeaknesses", () => {
  it("returns empty array when all attempts are correct", () => {
    expect(
      computeWeaknesses([
        { skill: "listening", correct: true },
        { skill: "reading", correct: true },
      ]),
    ).toEqual([]);
  });

  it("aggregates wrong counts by skill", () => {
    expect(
      computeWeaknesses([
        { skill: "listening", correct: false },
        { skill: "listening", correct: false },
        { skill: "reading", correct: false },
        { skill: "grammar", correct: true },
      ]),
    ).toEqual([
      { skill: "listening", wrongCount: 2 },
      { skill: "reading", wrongCount: 1 },
    ]);
  });

  it("sorts by wrongCount descending", () => {
    expect(
      computeWeaknesses([
        { skill: "reading", correct: false },
        { skill: "listening", correct: false },
        { skill: "listening", correct: false },
        { skill: "vocabulary", correct: false },
        { skill: "vocabulary", correct: false },
        { skill: "vocabulary", correct: false },
      ]),
    ).toEqual([
      { skill: "vocabulary", wrongCount: 3 },
      { skill: "listening", wrongCount: 2 },
      { skill: "reading", wrongCount: 1 },
    ]);
  });

  it("ignores correct attempts when aggregating", () => {
    expect(
      computeWeaknesses([
        { skill: "listening", correct: true },
        { skill: "listening", correct: false },
      ]),
    ).toEqual([{ skill: "listening", wrongCount: 1 }]);
  });
});

describe("getWeaknessSummary", () => {
  const breakdown = [
    { skill: "vocabulary", wrongCount: 3 },
    { skill: "listening", wrongCount: 2 },
    { skill: "reading", wrongCount: 1 },
  ];

  it("returns only top skill for free users", () => {
    expect(getWeaknessSummary(breakdown, "free")).toEqual([
      { skill: "vocabulary", wrongCount: 3 },
    ]);
  });

  it("returns full breakdown for pro users", () => {
    expect(getWeaknessSummary(breakdown, "pro")).toEqual(breakdown);
  });

  it("returns empty array when breakdown is empty", () => {
    expect(getWeaknessSummary([], "free")).toEqual([]);
    expect(getWeaknessSummary([], "pro")).toEqual([]);
  });
});
