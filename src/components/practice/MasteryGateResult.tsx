"use client";

import type { MasteryOutcome } from "@/lib/coach/journey/mastery-gate";

type Props = {
  title: string;
  outcome: MasteryOutcome;
  displayScore: number | null;
  displayMax: number | null;
  skill?: string | null;
  passAtDisplay?: number;
  saving?: boolean;
  onPracticeAgain: () => void;
  onContinueWeek: () => void;
  onChallenge?: () => void;
};

function capitalizeSkill(skill: string): string {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

export default function MasteryGateResult({
  title,
  outcome,
  displayScore,
  displayMax,
  skill,
  passAtDisplay = 7,
  saving = false,
  onPracticeAgain,
  onContinueWeek,
  onChallenge,
}: Props) {
  const showScore = displayScore !== null && displayMax !== null;
  const weakLabel = skill ? capitalizeSkill(skill) : "this skill";

  return (
    <div className="surface-card p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-jade">Task results</p>
      <h2 className="mt-2 font-display text-xl font-semibold text-ink">{title}</h2>

      {showScore ? (
        <div className="mt-6">
          <p className="text-sm text-ink-muted">Score</p>
          <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-ink">
            {displayScore}{" "}
            <span className="text-2xl font-normal text-ink-muted">/ {displayMax}</span>
          </p>
        </div>
      ) : null}

      {outcome === "not_yet" ? (
        <>
          <p className="mt-4 text-sm text-ink-muted">
            Pass at {passAtDisplay} · <span className="font-medium text-seal">Not yet</span>
          </p>
          <p className="mt-2 text-sm text-ink-muted">Weak on: {weakLabel}</p>
          <button
            type="button"
            disabled={saving}
            onClick={onPracticeAgain}
            className="btn-primary mt-8 inline-flex disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Practice again"}
          </button>
        </>
      ) : null}

      {outcome === "passed" ? (
        <>
          <p className="mt-4 text-sm text-ink-muted">
            <span className="font-medium text-jade">Passed</span> · locked into your week
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={onContinueWeek}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Continue week"}
            </button>
            {onChallenge ? (
              <button
                type="button"
                disabled={saving}
                onClick={onChallenge}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Push toward 10
              </button>
            ) : null}
          </div>
        </>
      ) : null}

      {outcome === "challenged" ? (
        <>
          <p className="mt-4 text-sm text-ink-muted">
            <span className="font-medium text-jade">Challenge complete</span> · locked into your
            week
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={onContinueWeek}
            className="btn-primary mt-8 inline-flex disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : "Continue week"}
          </button>
        </>
      ) : null}
    </div>
  );
}
