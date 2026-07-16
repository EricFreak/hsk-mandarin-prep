// tests/lib/lp/catalog.test.ts
import { describe, it, expect } from "vitest";
import { COACH_PACKS, getCoachPack } from "@/lib/lp/catalog";
import { RHO_CENTS_PER_LP } from "@/lib/lp/pricing";

describe("coach pack catalog", () => {
  it("offers exactly 4/8/12 week packs at pinned prices", () => {
    expect(COACH_PACKS.map((p) => [p.id, p.weeks, p.lpBudget, p.priceCents])).toEqual([
      ["coach_4w", 4, 1300, 1300],
      ["coach_8w", 8, 2600, 2600],
      ["coach_12w", 12, 3900, 3900],
    ]);
  });

  it("price is always lpBudget × ρ (same rate as everything else)", () => {
    for (const p of COACH_PACKS) {
      expect(p.priceCents).toBe(p.lpBudget * RHO_CENTS_PER_LP);
    }
  });

  it("getCoachPack resolves by id, null otherwise", () => {
    expect(getCoachPack("coach_8w")?.weeks).toBe(8);
    expect(getCoachPack("exam_custom")).toBeNull();
    expect(getCoachPack("nope")).toBeNull();
  });
});
