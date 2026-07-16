import { ensureLearnerProfile } from "@/lib/coach/build-snapshot";
import { isSprintEligible } from "@/lib/lp/sprint";
import { createClient } from "@/lib/supabase/server";
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

    const { error } = await supabase
      .from("learner_profiles")
      .update({
        service_intent: serviceIntent,
        target_exam_date: targetExamDate,
        journey_horizon_weeks: journeyHorizonWeeks,
        onboarding_prefs_at: now,
        updated_at: now,
      })
      .eq("user_id", user.id);

    if (error) {
      throw error;
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
