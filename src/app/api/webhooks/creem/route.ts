import {
  resolveCustomerId,
  resolveUserIdFromMetadata,
  setPlanByCustomerId,
  setUserPlan,
} from "@/lib/payments/subscription-sync";
import { verifyCreemWebhookSignature } from "@/lib/payments/creem";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type CreemWebhookPayload = {
  eventType?: string;
  object?: {
    metadata?: Record<string, unknown>;
    customer?: unknown;
    subscription?: {
      metadata?: Record<string, unknown>;
      customer?: unknown;
    };
  };
};

function resolveGrantContext(payload: CreemWebhookPayload): {
  userId: string | null;
  customerId: string | null;
} {
  const object = payload.object;
  const metadata =
    object?.metadata ??
    object?.subscription?.metadata ??
    null;

  return {
    userId: resolveUserIdFromMetadata(metadata),
    customerId:
      resolveCustomerId(object?.customer) ??
      resolveCustomerId(object?.subscription?.customer),
  };
}

async function grantPro(payload: CreemWebhookPayload) {
  const { userId, customerId } = resolveGrantContext(payload);

  if (userId) {
    await setUserPlan(userId, "pro", customerId);
    return;
  }

  if (customerId) {
    await setPlanByCustomerId(customerId, "pro");
  }
}

async function revokePro(payload: CreemWebhookPayload) {
  const { userId, customerId } = resolveGrantContext(payload);

  if (userId) {
    await setUserPlan(userId, "free");
    return;
  }

  if (customerId) {
    await setPlanByCustomerId(customerId, "free");
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Creem webhook is not configured" },
      { status: 503 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get("creem-signature");

  if (!verifyCreemWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: CreemWebhookPayload;
  try {
    payload = JSON.parse(body) as CreemWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    switch (payload.eventType) {
      case "checkout.completed":
      case "subscription.active":
      case "subscription.paid":
        await grantPro(payload);
        break;
      case "subscription.canceled":
      case "subscription.expired":
        await revokePro(payload);
        break;
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
