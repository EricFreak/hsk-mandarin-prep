import { ensureLearnerProfile } from "@/lib/coach/build-snapshot";
import { isSprintEligible } from "@/lib/lp/sprint";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function weeksUntilExam(examDate: string): number {
  const today = new Date().toISOString().slice(0, 10);
  const days = Math.round(
    (Date.parse(`${examDate}T00:00:00.000Z`) -
      Date.parse(`${today}T00:00:00.000Z`)) /
      86400000,
  );
  return Math.max(1, Math.ceil(days / 7));
}

const bodySchema = z.object({
  serviceIntent: z.enum(["coach", "exam_custom", "sprint"]),
  examDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  unsure: z.boolean(),
});

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

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

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { serviceIntent, examDate, unsure } = parsed.data;
  const effectiveUnsure = serviceIntent === "coach" ? unsure : false;

  // Non-coach services (exam_custom, sprint) always require an exam date.
  if (serviceIntent !== "coach" && !examDate) {
    return NextResponse.json(
      { error: "exam_date_required" },
      { status: 400 },
    );
  }

  if (!effectiveUnsure && !examDate) {
    return NextResponse.json(
      { error: "examDate is required unless unsure is true" },
      { status: 400 },
    );
  }

  try {
    await ensureLearnerProfile(supabase, user.id);

    const today = new Date().toISOString().slice(0, 10);
    if (!effectiveUnsure && examDate && examDate < today) {
      return NextResponse.json(
        { error: "examDate must be today or later" },
        { status: 400 },
      );
    }

    if (serviceIntent === "sprint" && !isSprintEligible(today, examDate)) {
      return NextResponse.json(
        { error: "not_sprint_eligible" },
        { status: 422 },
      );
    }

    const targetExamDate = effectiveUnsure ? null : examDate;
    const journeyHorizonWeeks = effectiveUnsure ? 12 : weeksUntilExam(examDate!);
    const now = new Date().toISOString();

    // Read the existing profile to detect an actual intent/exam-date change.
    // On change, clear the journey state so ensureJourney rebuilds on the next
    // coach run — otherwise a coach→sprint switch keeps the old 12-week
    // calendar and a moved exam date keeps stale stage allocation (review I5).
    // No-op resubmits must NOT clear.
    const { data: existing } = await supabase
      .from("learner_profiles")
      .select("service_intent, target_exam_date, stage_calendar")
      .eq("user_id", user.id)
      .maybeSingle();

    const intentChanged =
      (existing?.service_intent ?? null) !== serviceIntent;
    const examDateChanged =
      (existing?.target_exam_date ?? null) !== (targetExamDate ?? null);
    const journeyNeedsRebuild =
      (intentChanged || examDateChanged) &&
      Boolean(existing?.stage_calendar);

    const update: Record<string, unknown> = {
      service_intent: serviceIntent,
      target_exam_date: targetExamDate,
      journey_horizon_weeks: journeyHorizonWeeks,
      onboarding_prefs_at: now,
      updated_at: now,
    };
    if (journeyNeedsRebuild) {
      // ensureJourney's needsInit checks `!existingOutline.length ||
      // !stageCalendar.length` (persist-journey.ts) — nulling stage_calendar
      // and deleting outlines forces a fresh rebuild. Also drop the stale
      // current stage/week so the dashboard doesn't show a dead week until
      // the rebuild runs.
      update.stage_calendar = null;
      update.current_stage = null;
      update.current_week_index = 1;
    }

    const { error } = await supabase
      .from("learner_profiles")
      .update(update)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    if (journeyNeedsRebuild) {
      // journey_week_outlines has no user delete policy (migration 008 added
      // only select/insert/update), so use the admin client to clear stale
      // outline rows. Without this, a 12-week coach→sprint switch would leave
      // weeks 2-12 lingering after the rebuild upserts only week 1.
      const admin = createAdminClient();
      if (admin) {
        await admin
          .from("journey_week_outlines")
          .delete()
          .eq("user_id", user.id);
      }
    }

    return NextResponse.json({ next: "/diagnosis" });
  } catch (err) {
    console.error("Onboarding update failed:", err);
    return NextResponse.json(
      { error: "Failed to save onboarding preferences" },
      { status: 500 },
    );
  }
}
