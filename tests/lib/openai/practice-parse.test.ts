import { describe, it, expect } from "vitest";
import { parsePracticeQuestion } from "@/lib/openai/practice";

describe("parsePracticeQuestion", () => {
  const valid = {
    stem: "我___去学校。",
    choices: ["想", "吃", "看", "买"],
    answerIndex: 0,
    explanation: "想 means 'want to' and fits the sentence.",
    skill: "vocabulary",
  };

  it("parses valid practice question JSON", () => {
    expect(parsePracticeQuestion(valid)).toEqual(valid);
  });

  it("rejects missing fields", () => {
    expect(() => parsePracticeQuestion({ stem: "incomplete" })).toThrow();
  });

  it("rejects invalid answerIndex", () => {
    expect(() =>
      parsePracticeQuestion({ ...valid, answerIndex: 4 }),
    ).toThrow();
  });

  it("rejects wrong number of choices", () => {
    expect(() =>
      parsePracticeQuestion({ ...valid, choices: ["a", "b"] }),
    ).toThrow();
  });

  it("rejects non-object input", () => {
    expect(() => parsePracticeQuestion(null)).toThrow();
    expect(() => parsePracticeQuestion("not json")).toThrow();
  });
});
