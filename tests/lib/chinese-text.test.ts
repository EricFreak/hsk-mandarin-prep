import { describe, expect, it } from "vitest";
import { extractHanzi, splitStemByScript } from "@/lib/chinese-text";
import { getWordsForLevel } from "@/lib/syllabus";
import { generatePracticeQuestion } from "@/lib/openai/practice";

describe("splitStemByScript", () => {
  it("splits hanzi from surrounding text", () => {
    expect(splitStemByScript("Choose meaning for: 办法 (bàn fǎ)")).toEqual([
      { type: "other", text: "Choose meaning for: " },
      { type: "hanzi", text: "办法" },
      { type: "other", text: " (bàn fǎ)" },
    ]);
  });

  it("extracts hanzi for speech", () => {
    expect(extractHanzi("我每天早上都要___一杯牛奶。")).toBe("我每天早上都要一杯牛奶");
  });
});

describe("generatePracticeQuestion fallback rotation", () => {
  it("returns different fallback questions when seed changes", async () => {
    const words = getWordsForLevel(3);
    const first = await generatePracticeQuestion(3, words, 1);
    const second = await generatePracticeQuestion(3, words, 2);

    expect(first.stem).not.toBe(second.stem);
  });
});
