import { describe, it, expect } from "vitest";
import { getLevelMeta, getWordsForLevel } from "@/lib/syllabus";

describe("syllabus", () => {
  it("returns HSK 3 cumulative targets from GF0025-2021", () => {
    const meta = getLevelMeta(3);
    expect(meta.vocabulary).toBe(2245);
    expect(meta.grammar).toBe(210);
    expect(meta.characters).toBe(900);
  });

  it("returns word entries for level 1", () => {
    const words = getWordsForLevel(1);
    expect(words.length).toBeGreaterThan(0);
    expect(words[0]).toMatchObject({
      hanzi: expect.any(String),
      pinyin: expect.any(String),
      english: expect.any(String),
    });
  });
});
