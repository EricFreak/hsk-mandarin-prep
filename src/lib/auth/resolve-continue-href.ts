/**
 * Canonical post-auth destination resolver.
 * Spec: docs/superpowers/specs/2026-07-14-post-login-closed-loop-design.md (rev 2)
 */

export type JourneyStage =
  | "needs_exam_prefs"
  | "needs_diagnosis"
  | "diagnosis_done"
  | "complete";

export type LearnerContinueProfile = {
  targetExamDate: string | null;
  journeyHorizonWeeks: number | null;
  journeyStartedAt: string | null;
  onboardingPrefsAt: string | null;
  diagnosisCompletedAt: string | null;
  w1ClearedAt?: string | null;
};

const ALLOWED_INTENTS = new Set([
  "/dashboard",
  "/mock-exam",
  "/practice",
  "/flashcards",
  "/mistakes",
  "/pricing",
  "/onboarding",
  "/diagnosis",
  "/dashboard/journey",
  "/dashboard/plans",
  "/dashboard/progress",
]);

const TOOL_INTENTS = new Set([
  "/mock-exam",
  "/practice",
  "/flashcards",
  "/mistakes",
]);

function hasExamPrefs(profile: LearnerContinueProfile | null | undefined): boolean {
  if (!profile) return false;
  if (profile.onboardingPrefsAt) return true;
  if (profile.targetExamDate) return true;
  // Legacy: real unsure submit wrote horizon without prefs stamp (pre-009)
  if (profile.journeyHorizonWeeks != null && profile.diagnosisCompletedAt) {
    return true;
  }
  if (
    profile.journeyHorizonWeeks != null &&
    profile.journeyStartedAt
  ) {
    return true;
  }
  return false;
}

export function resolveJourneyStage(
  profile: LearnerContinueProfile | null | undefined,
): JourneyStage {
  if (profile?.journeyStartedAt) return "complete";
  if (profile?.diagnosisCompletedAt) return "diagnosis_done";
  if (hasExamPrefs(profile)) return "needs_diagnosis";
  return "needs_exam_prefs";
}

export function isSafeIntent(intent: string | null | undefined): intent is string {
  if (!intent || !intent.startsWith("/") || intent.startsWith("//")) {
    return false;
  }
  if (ALLOWED_INTENTS.has(intent)) return true;
  if (intent.startsWith("/mock-exam/")) return true;
  if (intent.startsWith("/dashboard/")) return true;
  return false;
}

export function isToolIntent(intent: string): boolean {
  if (TOOL_INTENTS.has(intent)) return true;
  if (intent.startsWith("/mock-exam/")) return true;
  return false;
}

/**
 * Destination after auth or deep link.
 * - Prefs / diagnosis incomplete → forced setup
 * - diagnosis_done → Dashboard is allowed (coach status lives there)
 * - Tools require complete (Week 1 journey started)
 */
export function resolveContinueHref(input: {
  authenticated: boolean;
  profile?: LearnerContinueProfile | null;
  intent?: string | null;
}): string {
  const { authenticated, profile, intent } = input;

  if (!authenticated) {
    const next = isSafeIntent(intent) ? intent : "/onboarding";
    return `/login?next=${encodeURIComponent(next)}`;
  }

  const stage = resolveJourneyStage(profile);

  if (stage === "needs_exam_prefs") return "/onboarding";
  if (stage === "needs_diagnosis") return "/diagnosis";

  if (stage === "diagnosis_done") {
    // Tools still locked; dashboard (or other dashboard/*) is the durable home.
    // Never send user back into the blank diagnosis paper.
    if (isSafeIntent(intent) && intent.startsWith("/dashboard")) {
      return intent;
    }
    return "/dashboard";
  }

  // complete
  if (isSafeIntent(intent) && intent !== "/onboarding") {
    if (intent === "/diagnosis") return "/dashboard";
    return intent;
  }

  return "/dashboard";
}

export const MARKETING_PRIMARY_NEXT = "/onboarding";

export function anonymousMarketingPrimaryHref(): string {
  return `/login?next=${encodeURIComponent(MARKETING_PRIMARY_NEXT)}`;
}
