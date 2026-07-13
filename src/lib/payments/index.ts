import { createCreemCheckout, isCreemConfigured } from "@/lib/payments/creem";
import {
  createStripeCheckout,
  isStripeConfigured,
} from "@/lib/payments/stripe-provider";
import type { PaymentProvider, PriceType } from "@/lib/payments/types";

export {
  FREE_TIER_BENEFITS,
  PRO_BENEFITS,
  getAppUrl,
  type PaymentProvider,
  type PriceType,
} from "@/lib/payments/types";

export { isCreemConfigured, isStripeConfigured };

export function getActivePaymentProvider(): PaymentProvider | null {
  const explicit = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();

  if (explicit === "creem") {
    return isCreemConfigured() ? "creem" : null;
  }

  if (explicit === "stripe") {
    return isStripeConfigured() ? "stripe" : null;
  }

  if (isCreemConfigured()) {
    return "creem";
  }

  if (isStripeConfigured()) {
    return "stripe";
  }

  return null;
}

export function isCheckoutConfigured(): boolean {
  return getActivePaymentProvider() !== null;
}

export async function createCheckoutSession(params: {
  priceType: PriceType;
  userId: string;
  userEmail?: string | null;
}): Promise<{ url: string; provider: PaymentProvider }> {
  const provider = getActivePaymentProvider();

  if (!provider) {
    throw new Error("Payments are not configured");
  }

  if (provider === "creem") {
    const checkout = await createCreemCheckout(params);
    return { ...checkout, provider };
  }

  const checkout = await createStripeCheckout(params);
  return { ...checkout, provider };
}
