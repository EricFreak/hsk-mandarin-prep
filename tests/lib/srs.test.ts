import { describe, it, expect } from "vitest";
import { sm2, type SrsCard } from "@/lib/srs";

describe("sm2", () => {
  it("resets interval on quality < 3", () => {
    const card: SrsCard = { interval: 10, repetitions: 3, easeFactor: 2.5 };
    const next = sm2(card, 1);
    expect(next.repetitions).toBe(0);
    expect(next.interval).toBe(1);
  });

  it("increases interval on good recall", () => {
    const card: SrsCard = { interval: 1, repetitions: 1, easeFactor: 2.5 };
    const next = sm2(card, 4);
    expect(next.repetitions).toBe(2);
    expect(next.interval).toBeGreaterThan(1);
  });
});
