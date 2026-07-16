import { createLpCheckout } from "@/lib/payments/stripe-provider";
import { fulfillLpOrder } from "@/lib/lp/fulfill-order";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ orderId: z.string().uuid() });

const PRODUCT_NAMES: Record<string, string> = {
  coach_4w: "Coach package · 4 weeks",
  coach_8w: "Coach package · 8 weeks",
  coach_12w: "Coach package · 12 weeks",
  exam_custom: "Custom exam plan",
  sprint: "Emergency sprint",
};

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { data: order } = await supabase
    .from("lp_orders")
    .select("id, service_type, price_cents, status")
    .eq("id", parsed.data.orderId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!order || order.status !== "quoted") {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }

  // Defense-in-depth (review C1): the order must be for a known service.
  // All inserts now go through admin-client server routes that compute the
  // price themselves, so a forged row with an unknown service_type can be
  // rejected here before any Stripe call or fulfillment.
  if (!PRODUCT_NAMES[order.service_type]) {
    return NextResponse.json({ error: "invalid_service_type" }, { status: 409 });
  }

  if (order.price_cents === 0) {
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Checkout is not configured" },
        { status: 503 },
      );
    }
    const result = await fulfillLpOrder(admin, { orderId: order.id });
    if (!result.ok) {
      return NextResponse.json(
        { error: "Failed to fulfill order" },
        { status: 500 },
      );
    }
    return NextResponse.json({ url: "/dashboard?purchased=1" });
  }

  const productName = PRODUCT_NAMES[order.service_type] ?? "HSK Prep package";
  try {
    const { url } = await createLpCheckout({
      orderId: order.id,
      userId: user.id,
      userEmail: user.email ?? undefined,
      priceCents: order.price_cents,
      productName,
    });
    return NextResponse.json({ url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create checkout session";

    if (message.includes("not configured")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
