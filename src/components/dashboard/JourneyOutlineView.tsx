"use client";

import { formatStageLabel } from "@/lib/coach/journey/journey-summary";
import type { CoachJourneyPayload } from "@/lib/coach/fetch-coach";
import type { WeekOutlineRow } from "@/lib/coach/journey/types";

function statusBadge(status: WeekOutlineRow["status"]): {
  label: string;
  className: string;
} {
  switch (status) {
    case "passed":
      return {
        label: "Passed",
        className:
          "rounded-full border border-jade/30 bg-jade/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-jade",
      };
    case "available":
      return {
        label: "Available",
        className:
          "rounded-full border border-jade/40 bg-jade/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-jade",
      };
    default:
      return {
        label: "Locked",
        className:
          "rounded-full border border-mist bg-paper px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted",
      };
  }
}

type Props = {
  data: CoachJourneyPayload | undefined;
  error: Error | undefined;
};

export default function JourneyOutlineView({ data, error }: Props) {
  if (error && !data) {
    return (
      <div className="surface-card p-6">
        <p className="text-sm text-seal">Could not load your journey outline.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="surface-card p-6">
        <p className="text-sm text-ink-muted">Loading journey outline…</p>
      </div>
    );
  }

  if (!data.outline.length) {
    return (
      <div className="surface-card border-jade/20 bg-jade/5 p-6">
        <p className="text-sm text-ink-muted">
          Your journey outline will appear after onboarding and your first coach report.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="surface-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Current stage
        </p>
        <p className="mt-1 font-display text-lg font-semibold text-ink">
          {data.currentStage ? formatStageLabel(data.currentStage) : "—"}
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Week {data.currentWeekIndex}
          {data.daysToExam != null ? ` · ${data.daysToExam} days to exam` : null}
        </p>
      </div>

      <ol className="space-y-2">
        {data.outline.map((week) => {
          const badge = statusBadge(week.status);
          const isCurrent = week.weekIndex === data.currentWeekIndex;

          return (
            <li
              key={week.weekIndex}
              className={
                isCurrent
                  ? "rounded-xl border-2 border-jade/35 bg-jade/5 px-4 py-4"
                  : "surface-card px-4 py-4"
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Week {week.weekIndex}
                    </p>
                    <span className={badge.className}>{badge.label}</span>
                    <span className="rounded-md border border-mist bg-paper px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                      {formatStageLabel(week.stage)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-ink">{week.theme}</p>
                  {week.skillFocus.length > 0 ? (
                    <p className="mt-1 text-xs text-ink-muted">
                      Focus:{" "}
                      {week.skillFocus
                        .map((skill) => skill.charAt(0).toUpperCase() + skill.slice(1))
                        .join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
