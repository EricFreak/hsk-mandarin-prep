/** Canonical free-funnel event names — keep stable for dashboards. */
export const FUNNEL_EVENTS = {
  lpView: "lp_view",
  lpCtaClick: "lp_cta_click",
  signupCompleted: "signup_completed",
  signupPending: "signup_pending",
  loginCompleted: "login_completed",
  onboardingSubmitted: "onboarding_submitted",
  diagnosisStarted: "diagnosis_started",
  diagnosisCompleted: "diagnosis_completed",
  coachReady: "coach_ready",
  coachError: "coach_error",
  quoteViewed: "quote_viewed",
} as const;

export type FunnelEventName =
  (typeof FUNNEL_EVENTS)[keyof typeof FUNNEL_EVENTS];

export type FunnelProps = Record<string, string | number | boolean | null | undefined>;
