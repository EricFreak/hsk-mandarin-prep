import Link from "next/link";
import UpgradeCTA from "@/components/paywall/UpgradeCTA";
import {
  canViewWeaknessDetail,
  planLabel,
  type Plan,
} from "@/lib/entitlements";
import {
  computeWeaknesses,
  getWeaknessSummary,
  type AttemptResult,
  type WeaknessEntry,
} from "@/lib/weakness";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

type MockExamRow = {
  id: string;
  score: number;
  created_at: string;
  breakdown: unknown;
};

type PracticeAttemptRow = {
  created_at: string;
  correct: boolean;
  skill: string;
};

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

function sinceDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Supabase is not configured. Connect your database to see progress.
        </p>
      </div>
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const since30 = sinceDays(30);
  const since7Ms = new Date(sinceDays(7)).getTime();

  const [
    { data: profile },
    { data: examAttempts },
    { data: practiceAttempts },
  ] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle(),
    supabase
      .from("mock_exam_attempts")
      .select("id, score, created_at, breakdown")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("practice_attempts")
      .select("skill, correct, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .gte("created_at", since30)
      .limit(500),
  ]);

  const plan: Plan = profile?.plan === "pro" ? "pro" : "free";
  const attempts = (examAttempts ?? []) as MockExamRow[];
  const exam = attempts[0] ?? null;
  const practiceTrends = (practiceAttempts ?? []) as PracticeAttemptRow[];
  const practiceResults = practiceTrends as unknown as AttemptResult[];

  const last7 = practiceTrends.filter(
    (row) => new Date(row.created_at).getTime() >= since7Ms,
  );
  const last30 = practiceTrends;

  const last7Answered = last7.length;
  const last7Accuracy =
    last7Answered === 0 ? null : (last7.filter((row) => row.correct).length / last7Answered) * 100;

  const last30Answered = last30.length;
  const last30Accuracy =
    last30Answered === 0
      ? null
      : (last30.filter((row) => row.correct).length / last30Answered) * 100;

  let fullBreakdown: WeaknessEntry[] = [];

  const normalizedBreakdown: {
    attempts?: AttemptResult[];
    weaknesses?: WeaknessEntry[];
  } | null = (() => {
    if (!exam?.breakdown) return null;
    if (typeof exam.breakdown === "string") {
      try {
        return JSON.parse(exam.breakdown) as {
          attempts?: AttemptResult[];
          weaknesses?: WeaknessEntry[];
        };
      } catch {
        return null;
      }
    }
    if (typeof exam.breakdown === "object") {
      return exam.breakdown as {
        attempts?: AttemptResult[];
        weaknesses?: WeaknessEntry[];
      };
    }
    return null;
  })();

  if (normalizedBreakdown?.weaknesses?.length) {
    fullBreakdown = normalizedBreakdown.weaknesses;
  } else if (normalizedBreakdown?.attempts?.length) {
    fullBreakdown = computeWeaknesses(normalizedBreakdown.attempts);
  } else if (practiceResults.length > 0) {
    fullBreakdown = computeWeaknesses(practiceResults);
  }

  const visibleBreakdown = getWeaknessSummary(fullBreakdown, plan);
  const showDetail = canViewWeaknessDetail(plan);
  const hiddenCount = fullBreakdown.length - visibleBreakdown.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Track your HSK prep progress, mock exam results, and skill weaknesses.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-ink-muted">Your plan</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            {planLabel(plan)}
          </p>
          {plan === "free" ? (
            <Link href="/pricing" className="mt-3 inline-block text-sm text-link">
              Upgrade to Pro
            </Link>
          ) : null}
        </div>

        <div className="surface-card p-6">
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
              No mock exam yet.{" "}
              <Link href="/mock-exam" className="text-link">
                Take your first exam
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-ink-muted">Practice · last 7 days</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            {last7Answered}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Accuracy: {last7Accuracy === null ? "—" : formatPercent(last7Accuracy)}
          </p>
        </div>
        <div className="surface-card p-6">
          <p className="text-sm font-medium text-ink-muted">Practice · last 30 days</p>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            {last30Answered}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Accuracy: {last30Accuracy === null ? "—" : formatPercent(last30Accuracy)}
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

        {attempts.length === 0 ? (
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
                <div>
                  <p className="text-sm font-medium text-ink">
                    {attempt.score}% <span className="text-ink-muted">·</span>{" "}
                    {formatDate(attempt.created_at)}
                  </p>
                </div>
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
          {!showDetail && hiddenCount > 0 ? (
            <span className="text-xs font-semibold uppercase tracking-wide text-seal">
              Pro feature
            </span>
          ) : null}
        </div>

        {fullBreakdown.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            {exam
              ? "No weaknesses detected in your latest mock exam — great job. (You answered everything correctly.)"
              : practiceResults.length > 0
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
