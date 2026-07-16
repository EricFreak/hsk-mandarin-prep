import { computeQuote } from "@/lib/lp/pricing";
import {
  canUseFreeSprint,
  daysUntilExam,
  isSprintEligible,
  sprintComposition,
} from "@/lib/lp/sprint";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = todayIso();

  const { data: learner } = await supabase
    .from("learner_profiles")
    .select("target_exam_date, free_sprint_used_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!isSprintEligible(today, learner?.target_exam_date ?? null)) {
    return NextResponse.json({ error: "not_sprint_eligible" }, { status: 422 });
  }

  const days = daysUntilExam(today, learner!.target_exam_date!);
  const composition = sprintComposition(days);
  const quote = computeQuote(composition);
  const now = new Date().toISOString();

  if (canUseFreeSprint(learner!.free_sprint_used_at ?? null)) {
    // Lifetime-free first sprint: insert a paid $0 order and burn the flag.
    // RLS only lets users insert status='quoted', so both writes use the
    // admin client (same helper as webhook/checkout fulfillment).
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Sprint checkout is not configured" },
        { status: 503 },
      );
    }

    const { error: orderErr } = await admin.from("lp_orders").insert({
      user_id: user.id,
      service_type: "sprint",
      composition,
      lp_total: quote.lpTotal,
      price_cents: 0,
      status: "paid",
      paid_at: now,
    });
    if (orderErr) {
      return NextResponse.json({ error: "sprint_failed" }, { status: 500 });
    }

    await admin
      .from("learner_profiles")
      .update({ free_sprint_used_at: now, updated_at: now })
      .eq("user_id", user.id);

    return NextResponse.json({ started: true });
  }

  // Repeat sprint: quote it (RLS allows own quoted inserts) for /api/checkout.
  const { data: inserted, error } = await supabase
    .from("lp_orders")
    .insert({
      user_id: user.id,
      service_type: "sprint",
      composition,
      lp_total: quote.lpTotal,
      price_cents: quote.priceCents,
      status: "quoted",
    })
    .select("id")
    .single();
  if (error || !inserted) {
    return NextResponse.json({ error: "sprint_failed" }, { status: 500 });
  }

  return NextResponse.json({
    started: false,
    orderId: inserted.id,
    priceCents: quote.priceCents,
  });
}
