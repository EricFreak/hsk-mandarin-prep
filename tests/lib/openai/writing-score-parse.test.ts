import { describe, it, expect } from "vitest";
import { parseWritingScore } from "@/lib/openai/writing-score";

describe("parseWritingScore", () => {
  const valid = {
    score: 78,
    grammarNotes: ["Good use of 因为…所以… structure."],
    vocabularyNotes: ["Sport vocabulary is appropriate for HSK 3."],
    suggestions: [
      "Add more detail about when you play this sport.",
      "Try using 最喜欢 to emphasize your preference.",
    ],
  };

  it("parses valid writing score JSON", () => {
    expect(parseWritingScore(valid)).toEqual(valid);
  });

  it("rejects missing fields", () => {
    expect(() => parseWritingScore({ score: 50 })).toThrow();
  });

  it("rejects score out of range", () => {
    expect(() => parseWritingScore({ ...valid, score: 101 })).toThrow();
    expect(() => parseWritingScore({ ...valid, score: -1 })).toThrow();
  });

  it("rejects empty note strings", () => {
    expect(() =>
      parseWritingScore({ ...valid, grammarNotes: [""] }),
    ).toThrow();
  });

  it("rejects non-object input", () => {
    expect(() => parseWritingScore(null)).toThrow();
    expect(() => parseWritingScore("not json")).toThrow();
  });
});
