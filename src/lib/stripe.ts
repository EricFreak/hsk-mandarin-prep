export { PRO_BENEFITS, getAppUrl } from "@/lib/payments/types";

import Stripe from "stripe";

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}
