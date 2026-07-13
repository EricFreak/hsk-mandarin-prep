import { describe, expect, it } from "vitest";
import { HSK3_MOCK_EXAM } from "@/lib/mock-exam/hsk3-template";
import { prepareMockExam } from "@/lib/mock-exam/prepare-exam";

describe("prepareMockExam", () => {
  it("distributes correct answers across choice positions", () => {
    const answerIndexes = HSK3_MOCK_EXAM.filter((q) => q.answerIndex !== undefined).map(
      (q) => q.answerIndex,
    );

    expect(answerIndexes.filter((index) => index === 0).length).toBeLessThan(
      answerIndexes.length - 1,
    );
    expect(new Set(answerIndexes).size).toBeGreaterThan(1);
  });

  it("keeps the same correct choice after shuffling", () => {
    const shuffled = prepareMockExam(HSK3_MOCK_EXAM);
    for (const question of shuffled) {
      if (!question.choices || question.answerIndex === undefined) continue;
      expect(question.choices[question.answerIndex]).toBeTruthy();
    }
  });
});

describe("HSK3 listening template", () => {
  it("hides Chinese transcript in stem and stores it in audioText", () => {
    const listening = HSK3_MOCK_EXAM.filter((q) => q.section === "listening");

    for (const question of listening) {
      expect(question.audioText).toBeTruthy();
      expect(question.stem).not.toMatch(/[\u4e00-\u9fff]/);
      expect(question.audioText).toMatch(/[\u4e00-\u9fff]/);
    }
  });
});
