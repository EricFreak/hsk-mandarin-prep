import { describe, expect, it } from "vitest";
import { formatPinyinSpaced } from "@/lib/pinyin";

describe("formatPinyinSpaced", () => {
  it("splits multi-syllable words", () => {
    expect(formatPinyinSpaced("bànfǎ")).toBe("bàn fǎ");
    expect(formatPinyinSpaced("cāntīng")).toBe("cān tīng");
    expect(formatPinyinSpaced("qíshí")).toBe("qí shí");
    expect(formatPinyinSpaced("Chángchéng")).toBe("Cháng chéng");
  });

  it("keeps already-spaced phrases readable", () => {
    expect(formatPinyinSpaced("nǐ hǎo")).toBe("nǐ hǎo");
  });

  it("handles neutral-tone syllables", () => {
    expect(formatPinyinSpaced("xièxie")).toBe("xiè xie");
    expect(formatPinyinSpaced("yǎnjing")).toBe("yǎn jing");
  });

  it("handles single-syllable words", () => {
    expect(formatPinyinSpaced("wǒ")).toBe("wǒ");
    expect(formatPinyinSpaced("shì")).toBe("shì");
  });
});
