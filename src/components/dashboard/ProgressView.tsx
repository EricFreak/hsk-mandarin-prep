"use client";

import Link from "next/link";
import UpgradeCTA from "@/components/paywall/UpgradeCTA";
import type { CoachReportsPayload } from "@/lib/coach/fetch-coach";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((response) => {
    if (!response.ok) throw new Error("Failed to load progress");
    return response.json() as Promise<CoachReportsPayload>;
  });

function capitalizeSkill(skill: string): string {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProgressView() {
  const { data, error } = useSWR("/api/coach/reports", fetcher);

  if (error) {
    return <p className="text-sm text-seal">Could not load progress.</p>;
  }

  if (!data) {
    return <p className="text-sm text-ink-muted">Loading progress…</p>;
  }

  if (data.reports.length === 0) {
    return (
      <div className="surface-card p-6">
        <p className="text-sm text-ink-muted">
          No coach reports yet. Complete a mock exam to start tracking multi-dimensional progress.
        </p>
        <Link href="/mock-exam" className="btn-primary mt-4 inline-flex">
          Take mock exam
        </Link>
      </div>
    );
  }

  const maxReadiness = Math.max(
    ...data.reports.map((r) => r.readiness_score ?? 0),
    1,
  );

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Readiness over reports</h2>
        <p className="mt-1 text-sm text-ink-muted">One point per AI coach report (newest first).</p>
        <ul className="mt-4 space-y-3">
          {data.reports.map((report) => {
            const score = report.readiness_score ?? 0;
            const width = `${Math.round((score / maxReadiness) * 100)}%`;
            return (
              <li key={report.id}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink-muted">{formatDate(report.created_at)}</span>
                  <span className="font-medium text-ink">{score}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-mist">
                  <div className="h-full rounded-full bg-jade" style={{ width }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-4">
        {data.reports.map((report) => (
          <div key={report.id} className="surface-card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-base font-semibold text-ink">
                Report · {formatDate(report.created_at)}
              </h3>
              <p className="text-sm text-ink-muted">Readiness {report.readiness_score ?? "—"}%</p>
            </div>
            {report.gaps.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Gaps</p>
                <ul className="mt-2 space-y-2">
                  {report.gaps.map((gap) => (
                    <li key={`${report.id}-${gap.skill}`} className="text-sm text-ink-muted">
                      <span className="font-medium text-ink">{capitalizeSkill(gap.skill)}</span>
                      {" — "}
                      {gap.evidence}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {report.strengths.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Strengths
                </p>
                <ul className="mt-2 space-y-2">
                  {report.strengths.map((item) => (
                    <li key={`${report.id}-${item.skill}`} className="text-sm text-ink-muted">
                      <span className="font-medium text-ink">{capitalizeSkill(item.skill)}</span>
                      {" — "}
                      {item.evidence}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {data.plan === "free" ? (
        <UpgradeCTA
          title="Unlock full progress history"
          description="Pro shows complete gaps, strengths, and trends across reports — plus your full week plan."
          className="text-left"
        />
      ) : null}
    </div>
  );
}
