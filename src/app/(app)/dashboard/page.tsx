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

async function getUserPlan(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<Plan> {
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  return data?.plan === "pro" ? "pro" : "free";
}

type MockExamRow = {
  score: number;
  created_at: string;
  breakdown: {
    attempts?: AttemptResult[];
    weaknesses?: WeaknessEntry[];
  } | null;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function capitalizeSkill(skill: string): string {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
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

  const plan = await getUserPlan(supabase, user.id);

  const [{ data: recentExam }, { data: practiceAttempts }] = await Promise.all([
    supabase
      .from("mock_exam_attempts")
      .select("score, created_at, breakdown")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("practice_attempts")
      .select("skill, correct")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const exam = recentExam as MockExamRow | null;
  const practiceResults = (practiceAttempts ?? []) as AttemptResult[];

  let fullBreakdown: WeaknessEntry[] = [];

  if (exam?.breakdown?.weaknesses?.length) {
    fullBreakdown = exam.breakdown.weaknesses;
  } else if (exam?.breakdown?.attempts?.length) {
    fullBreakdown = computeWeaknesses(exam.breakdown.attempts);
  } else if (practiceResults.length > 0) {
    fullBreakdown = computeWeaknesses(practiceResults);
  }

  const visibleBreakdown = getWeaknessSummary(fullBreakdown, plan);
  const showDetail = canViewWeaknessDetail(plan);
  const hiddenCount = fullBreakdown.length - visibleBreakdown.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track your HSK prep progress, mock exam results, and skill weaknesses.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Your plan</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {planLabel(plan)}
          </p>
          {plan === "free" ? (
            <Link
              href="/pricing"
              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Upgrade to Pro
            </Link>
          ) : null}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Latest mock exam</p>
          {exam ? (
            <>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {exam.score}%
              </p>
              <p className="mt-1 text-sm text-gray-500">
                HSK 3 — {formatDate(exam.created_at)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              No mock exam yet.{" "}
              <Link href="/mock-exam" className="font-medium text-blue-600 hover:text-blue-700">
                Take your first exam
              </Link>
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Weakness summary</h2>
          {!showDetail && hiddenCount > 0 ? (
            <span className="text-xs font-medium uppercase tracking-wide text-amber-700">
              Pro feature
            </span>
          ) : null}
        </div>

        {fullBreakdown.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">
            Complete a mock exam or practice session to see skill weaknesses here.
          </p>
        ) : (
          <div className="relative mt-4">
            <ul className="space-y-3">
              {visibleBreakdown.map((entry) => (
                <li
                  key={entry.skill}
                  className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {capitalizeSkill(entry.skill)}
                  </span>
                  <span className="text-sm text-gray-600">
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
                      className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-4 py-3"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {capitalizeSkill(entry.skill)}
                      </span>
                      <span className="text-sm text-gray-600">
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
        <Link
          href="/practice"
          className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Start practice
        </Link>
        <Link
          href="/mock-exam"
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Take mock exam
        </Link>
      </div>
    </div>
  );
}
