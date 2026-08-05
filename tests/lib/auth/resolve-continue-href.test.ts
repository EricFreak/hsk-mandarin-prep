import { describe, expect, it } from "vitest";
import {
  anonymousMarketingPrimaryHref,
  resolveContinueHref,
  resolveJourneyStage,
} from "@/lib/auth/resolve-continue-href";

const emptyPrefs = {
  targetExamDate: null as string | null,
  journeyHorizonWeeks: null as number | null,
  journeyStartedAt: null as string | null,
  onboardingPrefsAt: null as string | null,
  diagnosisCompletedAt: null as string | null,
};

describe("resolveJourneyStage", () => {
  it("needs exam prefs when nothing is set", () => {
    expect(resolveJourneyStage(emptyPrefs)).toBe("needs_exam_prefs");
  });

  it("needs exam prefs when only default horizon exists (no prefs stamp)", () => {
    // Migration 009: DEFAULT 12 must not fake prefs.
    expect(
      resolveJourneyStage({
        ...emptyPrefs,
        journeyHorizonWeeks: 12,
      }),
    ).toBe("needs_exam_prefs");
  });

  it("needs diagnosis when onboarding prefs stamped", () => {
    expect(
      resolveJourneyStage({
        ...emptyPrefs,
        onboardingPrefsAt: "2026-07-14T01:00:00.000Z",
        journeyHorizonWeeks: 12,
      }),
    ).toBe("needs_diagnosis");
  });

  it("needs diagnosis when exam date is set", () => {
    expect(
      resolveJourneyStage({
        ...emptyPrefs,
        targetExamDate: "2026-12-01",
        journeyHorizonWeeks: 12,
      }),
    ).toBe("needs_diagnosis");
  });

  it("is diagnosis_done after diagnosis stamp (before journey started)", () => {
    expect(
      resolveJourneyStage({
        ...emptyPrefs,
        onboardingPrefsAt: "2026-07-14T01:00:00.000Z",
        journeyHorizonWeeks: 12,
        diagnosisCompletedAt: "2026-07-14T01:30:00.000Z",
      }),
    ).toBe("diagnosis_done");
  });

  it("is complete when journey started", () => {
    expect(
      resolveJourneyStage({
        ...emptyPrefs,
        targetExamDate: "2026-12-01",
        journeyHorizonWeeks: 12,
        onboardingPrefsAt: "2026-07-14T01:00:00.000Z",
        diagnosisCompletedAt: "2026-07-14T01:30:00.000Z",
        journeyStartedAt: "2026-07-14T02:00:00.000Z",
      }),
    ).toBe("complete");
  });
});

describe("resolveContinueHref — journey matrix", () => {
  const incompletePrefs = { ...emptyPrefs };

  const needsDiagnosis = {
    ...emptyPrefs,
    onboardingPrefsAt: "2026-07-14T01:00:00.000Z",
    journeyHorizonWeeks: 12,
  };

  const diagnosisDone = {
    ...needsDiagnosis,
    diagnosisCompletedAt: "2026-07-14T01:30:00.000Z",
  };

  const complete = {
    ...diagnosisDone,
    targetExamDate: "2026-12-01",
    journeyStartedAt: "2026-07-14T02:00:00.000Z",
  };

  it("anonymous → login with onboarding next by default", () => {
    expect(resolveContinueHref({ authenticated: false })).toBe(
      "/login?next=%2Fonboarding",
    );
  });

  it("anonymous + mock intent still goes through login with that next", () => {
    expect(
      resolveContinueHref({
        authenticated: false,
        intent: "/mock-exam",
      }),
    ).toBe("/login?next=%2Fmock-exam");
  });

  it("authed + needs prefs → /onboarding (never /login)", () => {
    expect(
      resolveContinueHref({
        authenticated: true,
        profile: incompletePrefs,
        intent: "/mock-exam",
      }),
    ).toBe("/onboarding");
  });

  it("authed + needs diagnosis → /diagnosis even if intent is mock", () => {
    expect(
      resolveContinueHref({
        authenticated: true,
        profile: needsDiagnosis,
        intent: "/mock-exam",
      }),
    ).toBe("/diagnosis");
  });

  it("authed + diagnosis_done + tool intent → /dashboard (no bounce to paper)", () => {
    expect(
      resolveContinueHref({
        authenticated: true,
        profile: diagnosisDone,
        intent: "/mock-exam",
      }),
    ).toBe("/dashboard");
  });

  it("authed + diagnosis_done + /diagnosis → /dashboard (no retake)", () => {
    expect(
      resolveContinueHref({
        authenticated: true,
        profile: diagnosisDone,
        intent: "/diagnosis",
      }),
    ).toBe("/dashboard");
  });

  it("authed + diagnosis_done + dashboard intent → that dashboard path", () => {
    expect(
      resolveContinueHref({
        authenticated: true,
        profile: diagnosisDone,
        intent: "/dashboard/journey",
      }),
    ).toBe("/dashboard/journey");
  });

  it("authed Pro complete + mock intent → /mock-exam", () => {
    expect(
      resolveContinueHref({
        authenticated: true,
        profile: complete,
        intent: "/mock-exam",
      }),
    ).toBe("/mock-exam");
  });

  it("authed complete + /diagnosis → /dashboard", () => {
    expect(
      resolveContinueHref({
        authenticated: true,
        profile: complete,
        intent: "/diagnosis",
      }),
    ).toBe("/dashboard");
  });

  it("authed complete + no intent → /dashboard", () => {
    expect(
      resolveContinueHref({
        authenticated: true,
        profile: complete,
      }),
    ).toBe("/dashboard");
  });

  it("rejects open redirects", () => {
    expect(
      resolveContinueHref({
        authenticated: true,
        profile: complete,
        intent: "//evil.example",
      }),
    ).toBe("/dashboard");
  });
});

describe("anonymousMarketingPrimaryHref", () => {
  it("points at onboarding door (Decision A1)", () => {
    expect(anonymousMarketingPrimaryHref()).toBe("/login?next=%2Fonboarding");
  });
});
