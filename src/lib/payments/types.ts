export type PriceType = "monthly" | "yearly";

export type PaymentProvider = "creem" | "stripe";

export const PRO_BENEFITS = [
  "Unlimited AI practice questions",
  "All HSK mock exams",
  "AI writing score and feedback",
  "Detailed weakness reports",
  "Mistake review bank",
] as const;

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
