import Stripe from "stripe";
import { getAppUrl } from "@/lib/payments/types";

function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }

  return new Stripe(secretKey);
}

export async function createLpCheckout(input: {
  orderId: string;
  userId: string;
  userEmail?: string;
  priceCents: number;
  productName: string;
}): Promise<{ url: string }> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const appUrl = getAppUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: input.userId,
    customer_email: input.userEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: input.priceCents,
          product_data: { name: input.productName },
        },
      },
    ],
    success_url: `${appUrl}/dashboard?purchased=1`,
    cancel_url: `${appUrl}/plan/quote`,
    metadata: { userId: input.userId, orderId: input.orderId },
  });

  if (!session.url) {
    throw new Error("stripe_checkout_no_url");
  }

  return { url: session.url };
}
