"use client";

import Link from "next/link";
import UpgradeCTA from "@/components/paywall/UpgradeCTA";
import type { CoachDashboardPayload } from "@/lib/coach/fetch-coach";
import { readinessDelta, skillDirectionChips } from "@/lib/coach/progress-glance";

function capitalizeSkill(skill: string): string {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

function directionGlyph(direction: "up" | "down" | "flat"): string {
  if (direction === "up") return "↑";
  if (direction === "down") return "↓";
  return "→";
}

type Props = {
  data: CoachDashboardPayload | undefined;
};

export default function ProgressGlance({ data }: Props) {
  if (!data || data.status === "none") {
    return (
      <div className="surface-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Progress glance
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          After your first mock and coach report, readiness and skill direction appear here.
        </p>
      </div>
    );
  }

  if (data.status === "pending" && !data.report) {
    return (
      <div className="surface-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Progress glance
        </p>
        <p className="mt-2 text-sm text-ink-muted">Waiting for your coach report…</p>
      </div>
    );
  }

  const report = data.report;
  const previous = data.previousReport;
  const delta = readinessDelta(report, previous);
  const chipLimit = data.plan === "pro" ? 4 : 1;
  const chips = skillDirectionChips(report, previous, chipLimit);

  return (
    <div className="surface-card p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        Progress glance
      </p>
      <div className="mt-2 flex flex-wrap items-baseline gap-3">
        <p className="font-display text-2xl font-semibold text-ink">
          {report?.readiness_score != null ? `${report.readiness_score}%` : "—"}
        </p>
        <p className="text-sm text-ink-muted">
          readiness
          {delta != null ? (
            <>
              {" · "}
              <span className={delta > 0 ? "text-jade" : delta < 0 ? "text-seal" : undefined}>
                {delta > 0 ? `+${delta}` : delta} vs last
              </span>
            </>
          ) : null}
        </p>
      </div>

      {chips.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip.skill}
              className="rounded-md border border-mist bg-paper-dark px-3 py-1.5 text-xs font-medium text-ink"
            >
              {capitalizeSkill(chip.skill)} {directionGlyph(chip.direction)}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-muted">No skill signals on this report yet.</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Link href="/dashboard/progress" className="text-sm text-link">
          Full progress →
        </Link>
        {data.plan === "free" ? (
          <span className="text-xs text-ink-muted">Pro shows more skill chips</span>
        ) : null}
      </div>

      {data.plan === "free" ? (
        <div className="mt-4">
          <UpgradeCTA
            title="See full multi-dimensional progress"
            description="Unlock complete skill trends, gap history, and report comparison on Pro — alongside your full week plan."
            className="text-left"
          />
        </div>
      ) : null}
    </div>
  );
}
