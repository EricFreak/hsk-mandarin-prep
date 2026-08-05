// tests/lib/lp/pricing.test.ts
import { describe, it, expect } from "vitest";
import {
  LP_WEIGHTS,
  RHO_CENTS_PER_LP,
  EMPTY_COMPOSITION,
  computeLpTotal,
  computeQuote,
} from "@/lib/lp/pricing";

describe("LP pricing", () => {
  it("weights match the approved spec values", () => {
    expect(LP_WEIGHTS).toEqual({
      vocabulary: 1,
      grammar: 1,
      listening: 2,
      reading: 3,
      writingReview: 100,
      mockSection: 50,
    });
    expect(RHO_CENTS_PER_LP).toBe(1);
  });

  it("computes weighted LP total", () => {
    expect(
      computeLpTotal({
        ...EMPTY_COMPOSITION,
        vocabulary: 10,   // 10
        listening: 5,     // 10
        reading: 2,       // 6
        writingReview: 1, // 100
      })
    ).toBe(126);
  });

  it("empty composition is 0 LP / $0", () => {
    expect(computeQuote(EMPTY_COMPOSITION)).toEqual({ lpTotal: 0, priceCents: 0 });
  });

  it("clamps negative and fractional counts", () => {
    expect(
      computeLpTotal({ ...EMPTY_COMPOSITION, vocabulary: -5, listening: 2.9 })
    ).toBe(4); // -5 → 0, 2.9 → 2 → 2×2 LP
  });

  it("quote price = lpTotal × ρ", () => {
    const q = computeQuote({ ...EMPTY_COMPOSITION, mockSection: 3 });
    expect(q).toEqual({ lpTotal: 150, priceCents: 150 * RHO_CENTS_PER_LP });
  });
});
