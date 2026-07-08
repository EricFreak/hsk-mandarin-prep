import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

async function setUserPlan(
  userId: string,
  plan: "free" | "pro",
  stripeCustomerId?: string | null,
) {
  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("Supabase admin client is not configured");
  }

  const update: { plan: "free" | "pro"; stripe_customer_id?: string } = {
    plan,
  };

  if (stripeCustomerId) {
    update.stripe_customer_id = stripeCustomerId;
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

async function setPlanByCustomerId(
  customerId: string,
  plan: "free" | "pro",
) {
  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("Supabase admin client is not configured");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ plan })
    .eq("stripe_customer_id", customerId);

  if (error) {
    throw error;
  }
}

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

        if (customerId) {
          await setPlanByCustomerId(customerId, "free");
        } else if (subscription.metadata?.userId) {
          await setUserPlan(subscription.metadata.userId, "free");
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
