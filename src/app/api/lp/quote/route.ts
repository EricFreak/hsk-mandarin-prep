import { computeQuote, EMPTY_COMPOSITION, type LpComposition } from "@/lib/lp/pricing";
import { getCoachPack } from "@/lib/lp/catalog";
import { checkFeasibility, DEFAULT_MINUTES_PER_DAY } from "@/lib/lp/feasibility";
import { daysUntilExam, isSprintEligible, sprintComposition } from "@/lib/lp/sprint";
import { computeUnspentLp, applyCredit } from "@/lib/lp/replan-credit";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const compositionSchema = z.object({
  vocabulary: z.number().int().min(0),
  grammar: z.number().int().min(0),
  listening: z.number().int().min(0),
  reading: z.number().int().min(0),
  writingReview: z.number().int().min(0),
  mockSection: z.number().int().min(0),
});

const bodySchema = z.object({
  serviceType: z.enum(["coach_4w", "coach_8w", "coach_12w", "exam_custom", "sprint"]),
  composition: compositionSchema.optional(),
});

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

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
  const { serviceType } = parsed.data;

  const { data: learner } = await supabase
    .from("learner_profiles")
    .select("target_exam_date, minutes_per_day")
    .eq("user_id", user.id)
    .maybeSingle();

  let composition: LpComposition;
  let quote: ReturnType<typeof computeQuote>;
  let feasibility: ReturnType<typeof checkFeasibility> | undefined;

  const coachPack = getCoachPack(serviceType);
  if (coachPack) {
    // Coach: fixed budget & price; concrete composition comes from diagnosis at plan time.
    composition = { ...EMPTY_COMPOSITION };
    quote = { lpTotal: coachPack.lpBudget, priceCents: coachPack.priceCents };
  } else if (serviceType === "exam_custom") {
    if (!learner?.target_exam_date) {
      return NextResponse.json({ error: "exam_date_required" }, { status: 422 });
    }
    if (!parsed.data.composition) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    composition = parsed.data.composition;
    const days = daysUntilExam(todayIso(), learner.target_exam_date);
    if (days < 0) {
      // Past exam date — never clamp to a 1-day window (review Minor).
      return NextResponse.json({ error: "exam_date_in_past" }, { status: 422 });
    }
    feasibility = checkFeasibility({
      composition,
      daysUntilExam: days,
      minutesPerDay: learner.minutes_per_day ?? DEFAULT_MINUTES_PER_DAY,
    });
    if (!feasibility.feasible) {
      // Never silently trim — the user must reduce volume or move the date.
      return NextResponse.json(
        {
          error: "not_feasible",
          requiredMinutesPerDay: feasibility.requiredMinutesPerDay,
          capacityMinutes: feasibility.capacityMinutes,
        },
        { status: 422 },
      );
    }
    quote = computeQuote(composition);
  } else {
    // sprint (repeat purchase path; first-free goes through /api/sprint/start)
    if (!isSprintEligible(todayIso(), learner?.target_exam_date ?? null)) {
      return NextResponse.json({ error: "not_sprint_eligible" }, { status: 422 });
    }
    composition = sprintComposition(
      daysUntilExam(todayIso(), learner!.target_exam_date!),
    );
    quote = computeQuote(composition);
  }

  // Replan credit: transfer unspent LP from the current paid package (spec §8.3).
  let creditLp = 0;
  const { data: activeOrder } = await supabase
    .from("lp_orders")
    .select("id, lp_total, paid_at")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .maybeSingle();
  if (activeOrder && serviceType !== "sprint") {
    // Scope done tasks to the active order: only count work completed after
    // the order was paid, so superseded orders' tasks don't under-credit
    // (review I3). coach_plan_tasks.completed_at is the done-transition
    // timestamp (migration 006).
    const paidAt = activeOrder.paid_at ?? null;
    let doneQuery = supabase
      .from("coach_plan_tasks")
      .select("task_type, skill, target_count, status")
      .eq("user_id", user.id)
      .eq("status", "done");
    if (paidAt) {
      doneQuery = doneQuery.gte("completed_at", paidAt);
    }
    const { data: doneTasks, error: doneError } = await doneQuery;
    if (doneError) {
      // Log instead of silently zeroing credit (review Minor). Conservative:
      // credit stays 0 on error rather than over-crediting.
      console.error("lp/quote: done-tasks fetch failed", doneError);
    } else {
      creditLp = computeUnspentLp(activeOrder, doneTasks ?? []);
      quote = applyCredit(quote, creditLp);
    }
  }

  // Insert via admin client only — there is no user insert policy on
  // lp_orders (review C1). The server computes price_cents; a user cannot
  // self-mint a $0 order.
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Quoting is not configured" },
      { status: 503 },
    );
  }
  const { data: inserted, error } = await admin
    .from("lp_orders")
    .insert({
      user_id: user.id,
      service_type: serviceType,
      composition,
      lp_total: quote.lpTotal,
      price_cents: quote.priceCents,
      status: "quoted",
    })
    .select("id")
    .single();
  if (error || !inserted) {
    return NextResponse.json({ error: "quote_failed" }, { status: 500 });
  }

  return NextResponse.json({
    orderId: inserted.id,
    lpTotal: quote.lpTotal,
    priceCents: quote.priceCents,
    creditLp,
    feasibility,
  });
}
