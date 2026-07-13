import { describe, it, expect } from "vitest";
import { getLevelMeta, getWordsForLevel } from "@/lib/syllabus";

describe("syllabus", () => {
  it("ships a full HSK 3.0 practice word list (not a 10-word demo)", () => {
    const words = getWordsForLevel(3);
    const meta = getLevelMeta(3);
    expect(words.length).toBeGreaterThan(2000);
    expect(meta.vocabulary).toBe(words.length);
    expect(meta.characters).toBe(900);
    expect(meta.grammar).toBe(210);
    expect(words[0]).toMatchObject({
      hanzi: expect.any(String),
      pinyin: expect.any(String),
      english: expect.any(String),
    });
  });

  it("returns word entries for level 1 and 2", () => {
    expect(getWordsForLevel(1).length).toBeGreaterThan(400);
    expect(getWordsForLevel(2).length).toBeGreaterThan(1000);
  });
});
