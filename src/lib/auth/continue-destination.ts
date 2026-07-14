import { createClient } from "@/lib/supabase/server";
import {
  resolveContinueHref,
  type LearnerContinueProfile,
  type JourneyStage,
  resolveJourneyStage,
  MARKETING_PRIMARY_NEXT,
} from "@/lib/auth/resolve-continue-href";
import { redirect } from "next/navigation";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function mapLearnerRow(row: {
  target_exam_date?: string | null;
  journey_horizon_weeks?: number | null;
  journey_started_at?: string | null;
  onboarding_prefs_at?: string | null;
  diagnosis_completed_at?: string | null;
  w1_cleared_at?: string | null;
} | null): LearnerContinueProfile | null {
  if (!row) return null;
  return {
    targetExamDate: row.target_exam_date ?? null,
    journeyHorizonWeeks: row.journey_horizon_weeks ?? null,
    journeyStartedAt: row.journey_started_at ?? null,
    onboardingPrefsAt: row.onboarding_prefs_at ?? null,
    diagnosisCompletedAt: row.diagnosis_completed_at ?? null,
    w1ClearedAt: row.w1_cleared_at ?? null,
  };
}

export async function fetchLearnerContinueProfile(
  userId: string,
): Promise<LearnerContinueProfile | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = createClient();

  // Prefer full column set; fall back if migration 009 not applied yet.
  const full = await supabase
    .from("learner_profiles")
    .select(
      "target_exam_date, journey_horizon_weeks, journey_started_at, onboarding_prefs_at, diagnosis_completed_at, w1_cleared_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (!full.error && full.data) {
    return mapLearnerRow(full.data);
  }

  const legacy = await supabase
    .from("learner_profiles")
    .select("target_exam_date, journey_horizon_weeks, journey_started_at")
    .eq("user_id", userId)
    .maybeSingle();

  return mapLearnerRow(
    legacy.data
      ? {
          ...legacy.data,
          onboarding_prefs_at: null,
          diagnosis_completed_at: null,
          w1_cleared_at: null,
        }
      : null,
  );
}

export async function getSessionContinueContext(): Promise<{
  authenticated: boolean;
  userId: string | null;
  email: string | null;
  profile: LearnerContinueProfile | null;
  stage: JourneyStage | null;
}> {
  if (!hasSupabaseEnv()) {
    return {
      authenticated: false,
      userId: null,
      email: null,
      profile: null,
      stage: null,
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authenticated: false,
      userId: null,
      email: null,
      profile: null,
      stage: null,
    };
  }

  const profile = await fetchLearnerContinueProfile(user.id);
  return {
    authenticated: true,
    userId: user.id,
    email: user.email ?? null,
    profile,
    stage: resolveJourneyStage(profile),
  };
}

export async function resolveVisitorContinueHref(
  intent?: string | null,
): Promise<string> {
  const ctx = await getSessionContinueContext();
  return resolveContinueHref({
    authenticated: ctx.authenticated,
    profile: ctx.profile,
    intent: intent ?? MARKETING_PRIMARY_NEXT,
  });
}

/**
 * Guard app routes.
 * - allowIncomplete: onboarding / diagnosis screens
 * - allowDiagnosisHome: dashboard while coach pending (diagnosis_done)
 * - default: require complete (journey started)
 */
export async function requireJourneyRoute(options: {
  intent: string;
  allowIncomplete?: boolean;
  allowDiagnosisHome?: boolean;
}): Promise<{ userId: string; stage: JourneyStage; email: string | null }> {
  const ctx = await getSessionContinueContext();

  if (!ctx.authenticated || !ctx.userId) {
    redirect(
      resolveContinueHref({
        authenticated: false,
        intent: options.intent,
      }),
    );
  }

  const stage = ctx.stage ?? "needs_exam_prefs";

  if (options.allowIncomplete) {
    return { userId: ctx.userId, stage, email: ctx.email };
  }

  if (options.allowDiagnosisHome && stage === "diagnosis_done") {
    return { userId: ctx.userId, stage, email: ctx.email };
  }

  if (stage === "complete") {
    return { userId: ctx.userId, stage, email: ctx.email };
  }

  if (stage === "diagnosis_done") {
    // Tools not unlocked yet — send to dashboard (status home), not diagnosis paper.
    redirect("/dashboard");
  }

  redirect(
    resolveContinueHref({
      authenticated: true,
      profile: ctx.profile,
      intent: options.intent,
    }),
  );
}

/** Upsert profile without overwriting an existing Pro plan. */
export async function ensureProfileWithoutClobberingPlan(
  userId: string,
  email: string | null | undefined,
): Promise<void> {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, plan")
    .eq("id", userId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("profiles").insert({
      id: userId,
      email: email ?? null,
      plan: "free",
    });
    return;
  }

  if (email && email !== (existing as { email?: string }).email) {
    await supabase.from("profiles").update({ email }).eq("id", userId);
  }
}
