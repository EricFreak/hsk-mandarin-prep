export {
  PRO_BENEFITS,
  getAppUrl,
  type PriceType,
} from "@/lib/payments/types";

export { isStripeConfigured as getStripeConfigured } from "@/lib/payments/stripe-provider";

import Stripe from "stripe";
import type { PriceType } from "@/lib/payments/types";

/** @deprecated Prefer createCheckoutSession from @/lib/payments */
export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}

/** @deprecated Prefer createCheckoutSession from @/lib/payments */
export function getPriceId(priceType: PriceType): string | null {
  if (priceType === "monthly") {
    return process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || null;
  }

  return process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || null;
}
