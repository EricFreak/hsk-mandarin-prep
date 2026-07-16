"use client";

import Link from "next/link";
import JourneyStrip from "@/components/dashboard/JourneyStrip";
import LatestMockCard from "@/components/dashboard/LatestMockCard";
import ProgressGlance from "@/components/dashboard/ProgressGlance";
import ThisWeekZone from "@/components/dashboard/ThisWeekZone";
import type { CoachDashboardPayload } from "@/lib/coach/fetch-coach";
import { planLabel } from "@/lib/entitlements";
import { hasFullAccess } from "@/lib/lp/access";
import type { DashboardPayload } from "@/lib/dashboard-data";
import useSWR from "swr";

const dashboardFetcher = (url: string) =>
  fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load dashboard");
    }
    return response.json() as Promise<DashboardPayload>;
  });

const coachFetcher = (url: string) =>
  fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load coach data");
    }
    return response.json() as Promise<CoachDashboardPayload>;
  });

function displayValue(value: number | null | undefined, suffix = ""): string {
  if (value === null || value === undefined) return "—";
  return `${value}${suffix}`;
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export default function DashboardView() {
  const {
    data,
    error,
    isValidating,
  } = useSWR("/api/dashboard", dashboardFetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 3_000,
    keepPreviousData: true,
  });

  const {
    data: coach,
    error: coachError,
    isValidating: coachValidating,
    mutate: mutateCoach,
  } = useSWR("/api/coach/dashboard", coachFetcher, {
    refreshInterval: (latest) => (latest?.status === "pending" ? 4000 : 0),
    revalidateOnFocus: true,
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

  const plan = data?.plan ?? coach?.plan ?? "free";
  const showQuoteUpsell = !hasFullAccess(coach?.access ?? null);

  return (
    <div className="space-y-6">
      {isValidating || coachValidating ? (
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-jade" />
          Syncing latest progress
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Do this week&apos;s training. Glance at progress. Find past mocks when you need them.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-ink-muted">Plan</p>
          <p className="font-display text-lg font-semibold text-ink">
            {data || coach ? planLabel(plan) : "—"}
          </p>
          {showQuoteUpsell ? (
            <Link href="/plan/quote" className="text-sm text-link">
              View plans &amp; pricing
            </Link>
          ) : null}
        </div>
      </div>

      {coach?.status === "pending" ? (
        <div className="rounded-xl border border-jade/30 bg-jade/5 p-5">
          <h2 className="font-display text-base font-semibold text-ink">
            Building your Week 1 plan
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Your diagnosis score is saved. Tools unlock when Week 1 tasks are ready. You can
            stay here — this page refreshes automatically.
          </p>
          <button
            type="button"
            className="btn-secondary mt-4"
            onClick={() => {
              void fetch("/api/coach/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ trigger: "mock_exam_completed" }),
              }).then(() => mutateCoach());
            }}
          >
            Retry build
          </button>
        </div>
      ) : null}

      {coach?.currentStage ? (
        <JourneyStrip
          stage={coach.currentStage}
          daysToExam={coach.daysToExam}
          weekIndex={coach.weekIndex}
        />
      ) : null}

      <ThisWeekZone
        data={coach}
        error={coachError}
        isValidating={coachValidating}
        onRefreshCoach={() => {
          void fetch("/api/coach/report", { method: "POST" }).then(() => mutateCoach());
        }}
      />

      <ProgressGlance data={coach} />

      <LatestMockCard exam={data?.exam ?? null} loaded={Boolean(data)} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-5">
          <p className="text-sm font-medium text-ink-muted">Practice · last 7 days</p>
          <p className="mt-2 font-display text-xl font-semibold text-ink">
            {displayValue(data?.last7Answered)}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Accuracy:{" "}
            {data?.last7Accuracy === null || data?.last7Accuracy === undefined
              ? "—"
              : formatPercent(data.last7Accuracy)}
          </p>
        </div>
        <div className="surface-card p-5">
          <p className="text-sm font-medium text-ink-muted">Practice · last 30 days</p>
          <p className="mt-2 font-display text-xl font-semibold text-ink">
            {displayValue(data?.last30Answered)}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Accuracy:{" "}
            {data?.last30Accuracy === null || data?.last30Accuracy === undefined
              ? "—"
              : formatPercent(data.last30Accuracy)}
          </p>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-ink-muted">Mistake Bank</p>
            <Link href="/mistakes" className="text-sm text-link">
              Open
            </Link>
          </div>
          <p className="mt-2 text-sm text-ink-muted">Review recent incorrect answers.</p>
        </div>
      </div>

      {coach?.tutoringWechatId !== undefined ? (
        <div className="surface-card p-5">
          <h2 className="font-display text-base font-semibold text-ink">Need human help?</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Want 1-on-1 tutoring? Message us on WeChat for personalized coaching.
          </p>
          {coach.tutoringWechatId ? (
            <p className="mt-3 text-sm font-medium text-ink">WeChat: {coach.tutoringWechatId}</p>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">WeChat contact coming soon.</p>
          )}
        </div>
      ) : null}

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
