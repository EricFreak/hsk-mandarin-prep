import Stripe from "stripe";
import { getAppUrl, type PriceType } from "@/lib/payments/types";

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY &&
      process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,
  );
}

function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}

function getStripePriceId(priceType: PriceType): string | null {
  if (priceType === "monthly") {
    return process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || null;
  }

  return process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || null;
}

export async function createStripeCheckout(params: {
  priceType: PriceType;
  userId: string;
  userEmail?: string | null;
}): Promise<{ url: string }> {
  const stripe = getStripe();
  const priceId = getStripePriceId(params.priceType);

  if (!stripe || !priceId) {
    throw new Error("Stripe is not configured");
  }

  const appUrl = getAppUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: params.userEmail ?? undefined,
    client_reference_id: params.userId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=1`,
    cancel_url: `${appUrl}/pricing`,
    metadata: {
      userId: params.userId,
    },
    subscription_data: {
      metadata: {
        userId: params.userId,
      },
    },
  });

  if (!session.url) {
    throw new Error("Stripe checkout did not return a URL");
  }

  return { url: session.url };
}
