import {
  resolveUserIdFromMetadata,
  setPlanByCustomerId,
  setUserPlan,
} from "@/lib/payments/subscription-sync";
import { fulfillLpOrder } from "@/lib/lp/fulfill-order";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

function resolveUserId(session: Stripe.Checkout.Session): string | null {
  if (session.metadata?.userId) {
    return session.metadata.userId;
  }

  if (session.client_reference_id) {
    return session.client_reference_id;
  }

  return null;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          // One-time LP order payment — never touch profiles.plan.
          const admin = createAdminClient();
          if (!admin) {
            throw new Error("Supabase admin client is not configured");
          }
          const result = await fulfillLpOrder(admin, {
            orderId,
            paymentProvider: "stripe",
            paymentRef: session.id,
          });
          if (!result.ok) {
            throw new Error("lp_fulfillment_failed");
          }
          break;
        }

        // Legacy subscription checkout (no orderId metadata) → existing pro path.
        const userId = resolveUserId(session);
        const customerId =
          typeof session.customer === "string" ? session.customer : null;

        if (userId) {
          await setUserPlan(userId, "pro", customerId);
        } else if (customerId) {
          await setPlanByCustomerId(customerId, "pro");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        const userId = resolveUserIdFromMetadata(subscription.metadata);

        if (userId) {
          await setUserPlan(userId, "free");
        } else if (customerId) {
          await setPlanByCustomerId(customerId, "free");
        }
        break;
      }

      default:
        break;
    }
  } catch {
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
