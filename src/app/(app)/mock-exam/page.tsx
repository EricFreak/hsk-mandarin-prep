import MockExamSession from "@/components/mock-exam/MockExamSession";
import UpgradeCTA from "@/components/paywall/UpgradeCTA";
import { canTakeMockExam, type Plan } from "@/lib/entitlements";
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

export default async function MockExamPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">HSK 3 Mock Exam</h1>
          <p className="mt-2 text-sm text-gray-600">
            Supabase is not configured. Set environment variables to take the exam.
          </p>
        </div>
        <MockExamSession />
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

  const [plan, { count }] = await Promise.all([
    getUserPlan(supabase, user.id),
    supabase
      .from("mock_exam_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const completedExams = count ?? 0;
  const canTake = canTakeMockExam(plan, completedExams);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">HSK 3 Mock Exam</h1>
        <p className="mt-2 text-sm text-gray-600">
          A scaled-down HSK 3 exam with listening, reading, and writing sections.
          {plan === "free" ? " Free accounts include one mock exam." : null}
        </p>
      </div>

      {canTake ? (
        <MockExamSession />
      ) : (
        <UpgradeCTA
          title="Mock exam limit reached"
          description="You have completed your free HSK 3 mock exam. Upgrade to Pro for unlimited mock exams, detailed weakness reports, and AI writing feedback."
        />
      )}
    </div>
  );
}
