import Stripe from "stripe";

export type PriceType = "monthly" | "yearly";

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}

export function getPriceId(priceType: PriceType): string | null {
  if (priceType === "monthly") {
    return process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || null;
  }

  return process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || null;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const PRO_BENEFITS = [
  "Unlimited AI practice questions",
  "All HSK mock exams",
  "AI writing score and feedback",
  "Detailed weakness reports",
  "Mistake review bank",
] as const;
