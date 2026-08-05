import type { LpComposition, LpQuote } from "./pricing";
import { EMPTY_COMPOSITION, RHO_CENTS_PER_LP, computeLpTotal } from "./pricing";

export type DoneTaskRow = {
  task_type: string;
  skill: string | null;
  target_count: number | null;
  status: string;
};

const SKILL_TO_KEY: Record<string, keyof LpComposition> = {
  vocabulary: "vocabulary",
  grammar: "grammar",
  listening: "listening",
  reading: "reading",
  writing: "writingReview",
};

/** Internal settlement only — never surfaced as per-item metering in the UI. */
export function compositionFromDoneTasks(rows: DoneTaskRow[]): LpComposition {
  const c: LpComposition = { ...EMPTY_COMPOSITION };
  for (const row of rows) {
    if (row.status !== "done") continue;
    const count = Math.max(0, row.target_count ?? 1);
    if (row.task_type === "mock_section") {
      c.mockSection += 1;
    } else if (row.task_type === "flashcards") {
      c.vocabulary += count;
    } else if (row.task_type === "review_mistakes") {
      c.grammar += count;
    } else if (row.task_type === "practice" && row.skill && SKILL_TO_KEY[row.skill]) {
      c[SKILL_TO_KEY[row.skill]] += count;
    }
    // "rest" and unknown types carry no LP
  }
  return c;
}

export function computeUnspentLp(
  order: { lp_total: number },
  doneTasks: DoneTaskRow[]
): number {
  const consumed = computeLpTotal(compositionFromDoneTasks(doneTasks));
  return Math.max(0, order.lp_total - consumed);
}

/** Credit transfers into the new package price; no cash refunds. */
export function applyCredit(quote: LpQuote, unspentLp: number): LpQuote {
  const billableLp = Math.max(0, quote.lpTotal - unspentLp);
  return { lpTotal: quote.lpTotal, priceCents: billableLp * RHO_CENTS_PER_LP };
}
