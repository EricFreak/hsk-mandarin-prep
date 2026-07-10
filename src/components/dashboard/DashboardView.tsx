"use client";

import Link from "next/link";
import CoachPanel from "@/components/dashboard/CoachPanel";
import UpgradeCTA from "@/components/paywall/UpgradeCTA";
import { planLabel } from "@/lib/entitlements";
import type { DashboardPayload } from "@/lib/dashboard-data";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load dashboard");
    }
    return response.json() as Promise<DashboardPayload>;
  });

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function capitalizeSkill(skill: string): string {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

function displayValue(value: number | null | undefined, suffix = ""): string {
  if (value === null || value === undefined) return "—";
  return `${value}${suffix}`;
}

export default function DashboardView() {
  const { data, error, isValidating } = useSWR("/api/dashboard", fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 3_000,
    keepPreviousData: true,
  });

  if (error && !data) {
    return (
      <div className="rounded-xl border border-seal/20 bg-seal/5 p-6 text-center">
        <p className="text-sm text-seal">Could not load your dashboard.</p>
        <button
          type="button"
          onClick={() => void fetch("/api/dashboard").then(() => location.reload())}
          className="mt-4 btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  const plan = data?.plan ?? "free";
  const exam = data?.exam ?? null;
  const attempts = data?.attempts ?? [];
  const fullBreakdown = data?.fullBreakdown ?? [];
  const visibleBreakdown = data?.visibleBreakdown ?? [];
  const showDetail = data?.showDetail ?? false;
  const hiddenCount = data?.hiddenCount ?? 0;
  const hasPracticeResults = data?.hasPracticeResults ?? false;

  return (
    <div className="space-y-8">
      {isValidating ? (
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-jade" />
          Syncing latest progress
        </div>
      ) : null}

      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Your AI coach, mock exam results, and skill progress in one place.
        </p>
      </div>

      <CoachPanel />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="surface-card p-6 transition-opacity duration-200">
          <p className="text-sm font-medium text-ink-muted">Your plan</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            {data ? planLabel(plan) : "—"}
          </p>
          {data && plan === "free" ? (
            <Link href="/pricing" className="mt-3 inline-block text-sm text-link">
              Upgrade to Pro
            </Link>
          ) : null}
        </div>

        <div className="surface-card p-6 transition-opacity duration-200">
          <p className="text-sm font-medium text-ink-muted">Latest mock exam</p>
          {exam ? (
            <>
              <p className="mt-2 font-display text-2xl font-semibold text-ink">
                {exam.score}%
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                HSK 3 — {formatDate(exam.created_at)}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link href={`/mock-exam/attempts/${exam.id}`} className="text-sm text-link">
                  Review attempt
                </Link>
                <Link href="/mock-exam/attempts" className="text-sm text-link">
                  View history
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-ink-muted">
              {data ? (
                <>
                  No mock exam yet.{" "}
                  <Link href="/mock-exam" className="text-link">
                    Take your first exam
                  </Link>
                </>
              ) : (
                "—"
              )}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-ink-muted">Practice · last 7 days</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            {displayValue(data?.last7Answered)}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Accuracy:{" "}
            {data?.last7Accuracy === null || data?.last7Accuracy === undefined
              ? "—"
              : formatPercent(data.last7Accuracy)}
          </p>
        </div>
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-ink-muted">Practice · last 30 days</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            {displayValue(data?.last30Answered)}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Accuracy:{" "}
            {data?.last30Accuracy === null || data?.last30Accuracy === undefined
              ? "—"
              : formatPercent(data.last30Accuracy)}
          </p>
        </div>
        <div className="surface-card p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-ink-muted">Mistake Bank</p>
            <Link href="/mistakes" className="text-sm text-link">
              Open
            </Link>
          </div>
          <p className="mt-2 text-sm text-ink-muted">
            Review recent incorrect answers from practice and mock exams.
          </p>
        </div>
      </div>

      <div className="surface-card p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-semibold text-ink">Mock exam history</h2>
          <Link href="/mock-exam/attempts" className="text-sm text-link">
            View all
          </Link>
        </div>

        {!data ? (
          <p className="mt-4 text-sm text-ink-muted">—</p>
        ) : attempts.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            No attempts yet.{" "}
            <Link href="/mock-exam" className="text-link">
              Take your first exam
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {attempts.map((attempt) => (
              <li
                key={attempt.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-mist bg-paper-dark px-4 py-3"
              >
                <p className="text-sm font-medium text-ink">
                  {attempt.score}% <span className="text-ink-muted">·</span>{" "}
                  {formatDate(attempt.created_at)}
                </p>
                <Link
                  href={`/mock-exam/attempts/${attempt.id}`}
                  className="text-sm text-link"
                >
                  Review
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="surface-card p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-semibold text-ink">Weakness summary</h2>
          {data && !showDetail && hiddenCount > 0 ? (
            <span className="text-xs font-semibold uppercase tracking-wide text-seal">
              Pro feature
            </span>
          ) : null}
        </div>

        {!data ? (
          <p className="mt-4 text-sm text-ink-muted">—</p>
        ) : fullBreakdown.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            {exam
              ? "No weaknesses detected in your latest mock exam — great job. (You answered everything correctly.)"
              : hasPracticeResults
                ? "No weaknesses detected in your recent practice — great job."
                : "Complete a mock exam or practice session to see skill weaknesses here."}
          </p>
        ) : (
          <div className="relative mt-4">
            <ul className="space-y-3">
              {visibleBreakdown.map((entry) => (
                <li
                  key={entry.skill}
                  className="flex items-center justify-between rounded-lg border border-mist bg-paper-dark px-4 py-3"
                >
                  <span className="text-sm font-medium text-ink">
                    {capitalizeSkill(entry.skill)}
                  </span>
                  <span className="text-sm text-ink-muted">
                    {entry.wrongCount} incorrect
                  </span>
                </li>
              ))}
            </ul>

            {!showDetail && hiddenCount > 0 ? (
              <div className="relative mt-4">
                <div className="pointer-events-none select-none space-y-3 blur-sm">
                  {fullBreakdown.slice(1).map((entry) => (
                    <div
                      key={entry.skill}
                      className="flex items-center justify-between rounded-lg border border-mist bg-paper-dark px-4 py-3"
                    >
                      <span className="text-sm font-medium text-ink">
                        {capitalizeSkill(entry.skill)}
                      </span>
                      <span className="text-sm text-ink-muted">
                        {entry.wrongCount} incorrect
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <UpgradeCTA
                    title="Unlock full weakness report"
                    description="Upgrade to Pro to see your complete skill breakdown and target practice recommendations."
                    className="text-left"
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/practice" className="btn-primary">
          Start practice
        </Link>
        <Link href="/mock-exam" className="btn-secondary">
          Take mock exam
        </Link>
      </div>
    </div>
  );
}
