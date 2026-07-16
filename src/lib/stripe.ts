export { PRO_BENEFITS, getAppUrl } from "@/lib/payments/types";

export { isStripeConfigured as getStripeConfigured } from "@/lib/payments/stripe-provider";

import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}
