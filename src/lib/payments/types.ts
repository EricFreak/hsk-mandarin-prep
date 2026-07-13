export type PriceType = "monthly" | "yearly";

export type PaymentProvider = "creem" | "stripe";

export const FREE_TIER_BENEFITS = [
  "1 full HSK 3 mock exam",
  "AI coach report (truncated + top gap)",
  "Full Week 1 coach journey execution",
  "Journey roadmap outline through exam day",
  "20 AI practice questions per day",
  "SRS flashcards (HSK 3 vocabulary)",
] as const;

export const PRO_BENEFITS = [
  "Full AI coach report (gaps, strengths, readiness)",
  "Continue journey: Week 2+ after Week 1 cleared",
  "Unlimited HSK 3 mock exams",
  "Unlimited plan-driven AI practice",
  "AI writing score and feedback",
  "Full mistake review bank",
] as const;

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
