import { createCheckoutSession } from "@/lib/payments";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
  priceType: z.enum(["monthly", "yearly"]),
});

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
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "priceType must be 'monthly' or 'yearly'" },
      { status: 400 },
    );
  }

  try {
    const checkout = await createCheckoutSession({
      priceType: parsed.data.priceType,
      userId: user.id,
      userEmail: user.email,
    });

    return NextResponse.json({
      url: checkout.url,
      provider: checkout.provider,
    });
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
