import MockExamSession from "@/components/mock-exam/MockExamSession";
import UpgradeCTA from "@/components/paywall/UpgradeCTA";
import { requireJourneyRoute } from "@/lib/auth/continue-destination";
import { canTakeMockExam, type Plan } from "@/lib/entitlements";
import { hasFullAccess } from "@/lib/lp/access";
import { fetchAccess } from "@/lib/lp/access-server";
import { createClient } from "@/lib/supabase/server";

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

export default async function MockExamPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-ink">
            HSK Level 3 Mock Exam
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Supabase is not configured. Set environment variables to take the exam.
          </p>
        </div>
        <MockExamSession />
      </div>
    );
  }

  const { userId } = await requireJourneyRoute({ intent: "/mock-exam" });
  const supabase = createClient();

  const [plan, { count }, access] = await Promise.all([
    getUserPlan(supabase, userId),
    supabase
      .from("mock_exam_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("template_id", "in", '("hsk3-diagnosis","hsk3-placement")'),
    fetchAccess(supabase, userId),
  ]);

  const completedExams = count ?? 0;
  const canTake = canTakeMockExam(plan, hasFullAccess(access), completedExams);
  const canScoreWriting = hasFullAccess(access);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink">
          HSK Level 3 Mock Exam
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          A scaled-down HSK Level 3 exam with listening, reading, and writing sections.
          {plan === "free" ? " Free accounts include one mock exam." : null}
        </p>
      </div>

      {canTake ? (
        <MockExamSession canScoreWriting={canScoreWriting} />
      ) : (
        <UpgradeCTA
          title="Mock exam limit reached"
          description="You have completed your free HSK Level 3 mock exam. Upgrade to Pro for unlimited mock exams, detailed weakness reports, and AI writing feedback."
        />
      )}
    </div>
  );
}
