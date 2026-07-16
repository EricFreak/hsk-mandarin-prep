/**
 * Learning Point (LP) pricing core.
 * Single global rate — never vary by service type or urgency (spec hard rule).
 * All money math in this codebase must go through computeQuote.
 */
export type LpComposition = {
  vocabulary: number; // 题
  grammar: number; // 题
  listening: number; // 题
  reading: number; // 组
  writingReview: number; // 写作 + AI 精批 次
  mockSection: number; // 模考段 + 报告 次
};

export const LP_WEIGHTS: Record<keyof LpComposition, number> = {
  vocabulary: 1,
  grammar: 1,
  listening: 2,
  reading: 3,
  writingReview: 100,
  mockSection: 50,
};

export const RHO_CENTS_PER_LP = 1;

export const EMPTY_COMPOSITION: LpComposition = {
  vocabulary: 0,
  grammar: 0,
  listening: 0,
  reading: 0,
  writingReview: 0,
  mockSection: 0,
};

export type LpQuote = { lpTotal: number; priceCents: number };

export function computeLpTotal(composition: LpComposition): number {
  return (Object.keys(LP_WEIGHTS) as (keyof LpComposition)[]).reduce(
    (sum, key) =>
      sum + Math.max(0, Math.floor(composition[key] ?? 0)) * LP_WEIGHTS[key],
    0
  );
}

export function computeQuote(composition: LpComposition): LpQuote {
  const lpTotal = computeLpTotal(composition);
  return { lpTotal, priceCents: lpTotal * RHO_CENTS_PER_LP };
}
