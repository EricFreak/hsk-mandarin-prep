import { fulfillLpOrder } from "@/lib/lp/fulfill-order";
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

  // Guard (review I1): never silently supersede an active paid NON-sprint
  // package. A coach_*/exam_custom order with price_cents > 0 represents
  // purchased value that must not be destroyed by starting a sprint. The
  // free-sprint path and the repeat-purchase path both flow through here,
  // so a single check covers both.
  const { data: activePaidOrder } = await supabase
    .from("lp_orders")
    .select("id, service_type, price_cents")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .maybeSingle();
  if (
    activePaidOrder &&
    activePaidOrder.service_type !== "sprint" &&
    (activePaidOrder.price_cents ?? 0) > 0
  ) {
    return NextResponse.json(
      { error: "active_package_exists" },
      { status: 409 },
    );
  }

  if (canUseFreeSprint(learner!.free_sprint_used_at ?? null)) {
    // Lifetime-free first sprint. Insert as `quoted`, then flip to `paid` via
    // fulfillLpOrder, which supersedes any prior paid order for this user
    // before paying this one — so a user with an existing paid coach order
    // doesn't trip the `idx_lp_orders_one_paid_per_user` unique index.
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Sprint checkout is not configured" },
        { status: 503 },
      );
    }

    const { data: order, error: orderErr } = await admin
      .from("lp_orders")
      .insert({
        user_id: user.id,
        service_type: "sprint",
        composition,
        lp_total: quote.lpTotal,
        price_cents: 0,
        status: "quoted",
      })
      .select("id")
      .single();
    if (orderErr || !order) {
      return NextResponse.json({ error: "sprint_failed" }, { status: 500 });
    }

    const { ok } = await fulfillLpOrder(admin, { orderId: order.id });
    if (!ok) {
      return NextResponse.json({ error: "sprint_failed" }, { status: 500 });
    }

    // Burn the free-sprint flag last and check the error. If this write fails,
    // the next retry still sees canUseFreeSprint=true, inserts a fresh quoted
    // $0 order, and fulfillLpOrder supersedes the earlier paid $0 order — no
    // unique-index collision and no permanently stuck state.
    const { error: flagErr } = await admin
      .from("learner_profiles")
      .update({ free_sprint_used_at: now, updated_at: now })
      .eq("user_id", user.id);
    if (flagErr) {
      return NextResponse.json({ error: "sprint_failed" }, { status: 500 });
    }

    return NextResponse.json({ started: true });
  }

  // Repeat sprint: quote it through the admin client (no user insert policy
  // on lp_orders — review C1) for /api/checkout.
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Sprint checkout is not configured" },
      { status: 503 },
    );
  }
  const { data: inserted, error } = await admin
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
