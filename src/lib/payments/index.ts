import { isCreemConfigured } from "@/lib/payments/creem";
import { isStripeConfigured } from "@/lib/payments/stripe-provider";
import type { PaymentProvider } from "@/lib/payments/types";

export {
  FREE_TIER_BENEFITS,
  PRO_BENEFITS,
  getAppUrl,
  type PaymentProvider,
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
