import Link from "next/link";
import { requireJourneyRoute } from "@/lib/auth/continue-destination";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

type AttemptListRow = {
  id: string;
  score: number;
  status: string | null;
  created_at: string;
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function MockExamAttemptsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Mock exam attempts</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Supabase is not configured. Connect your database to see attempt history.
        </p>
      </div>
    );
  }

  const { userId } = await requireJourneyRoute({ intent: "/mock-exam" });
  const supabase = createClient();

  const { data } = await supabase
    .from("mock_exam_attempts")
    .select("id, score, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  const attempts = (data ?? []) as AttemptListRow[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Mock exam attempts</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Review past exams, see correct answers, and replay listening audio.
        </p>
      </div>

      {attempts.length === 0 ? (
        <div className="surface-card p-6">
          <p className="text-sm text-ink-muted">
            No attempts yet.{" "}
            <Link href="/mock-exam" className="text-link">
              Take your first exam
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="border-b border-mist px-6 py-4">
            <h2 className="text-sm font-semibold text-ink">History</h2>
          </div>
          <ul className="divide-y divide-mist">
            {attempts.map((attempt) => (
              <li key={attempt.id} className="px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      HSK 3 <span className="text-ink-muted">·</span>{" "}
                      {formatDateTime(attempt.created_at)}
                    </p>
                    {attempt.status ? (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        {attempt.status}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-xl font-semibold text-jade">
                      {attempt.score}%
                    </span>
                    <Link href={`/mock-exam/attempts/${attempt.id}`} className="btn-secondary">
                      Review
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/mock-exam" className="btn-primary">
          Take another exam
        </Link>
        <Link href="/dashboard" className="btn-secondary">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

