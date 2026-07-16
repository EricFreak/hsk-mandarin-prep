import {
  canViewWeaknessDetail,
  type Plan,
} from "@/lib/entitlements";
import {
  computeWeaknesses,
  getWeaknessSummary,
  type AttemptResult,
  type WeaknessEntry,
} from "@/lib/weakness";
import { createClient } from "@/lib/supabase/server";
import { fetchAccess } from "@/lib/lp/access-server";
import { hasFullAccess } from "@/lib/lp/access";

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

export type DashboardPayload = {
  plan: Plan;
  exam: Pick<MockExamRow, "id" | "score" | "created_at"> | null;
  attempts: Pick<MockExamRow, "id" | "score" | "created_at">[];
  last7Answered: number;
  last7Accuracy: number | null;
  last30Answered: number;
  last30Accuracy: number | null;
  fullBreakdown: WeaknessEntry[];
  visibleBreakdown: WeaknessEntry[];
  showDetail: boolean;
  hiddenCount: number;
  hasPracticeResults: boolean;
};

function sinceDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function normalizeBreakdown(breakdown: unknown): {
  attempts?: AttemptResult[];
  weaknesses?: WeaknessEntry[];
} | null {
  if (!breakdown) return null;
  if (typeof breakdown === "string") {
    try {
      return JSON.parse(breakdown) as {
        attempts?: AttemptResult[];
        weaknesses?: WeaknessEntry[];
      };
    } catch {
      return null;
    }
  }
  if (typeof breakdown === "object") {
    return breakdown as {
      attempts?: AttemptResult[];
      weaknesses?: WeaknessEntry[];
    };
  }
  return null;
}

export async function fetchDashboardForUser(
  userId: string,
): Promise<DashboardPayload> {
  const supabase = createClient();
  const since30 = sinceDays(30);
  const since7Ms = new Date(sinceDays(7)).getTime();

  const [
    { data: profile },
    { data: examAttempts },
    { data: practiceAttempts },
    access,
  ] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", userId).maybeSingle(),
    supabase
      .from("mock_exam_attempts")
      .select("id, score, created_at, breakdown")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("practice_attempts")
      .select("skill, correct, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .gte("created_at", since30)
      .limit(500),
    fetchAccess(supabase, userId),
  ]);

  const plan: Plan = profile?.plan === "pro" ? "pro" : "free";
  const fullAccess = hasFullAccess(access);
  const rows = (examAttempts ?? []) as MockExamRow[];
  const exam = rows[0] ?? null;
  const attempts = rows.map(({ id, score, created_at }) => ({
    id,
    score,
    created_at,
  }));

  const practiceTrends = (practiceAttempts ?? []) as PracticeAttemptRow[];
  const practiceResults = practiceTrends as unknown as AttemptResult[];

  const last7 = practiceTrends.filter(
    (row) => new Date(row.created_at).getTime() >= since7Ms,
  );
  const last30 = practiceTrends;

  const last7Answered = last7.length;
  const last7Accuracy =
    last7Answered === 0
      ? null
      : (last7.filter((row) => row.correct).length / last7Answered) * 100;

  const last30Answered = last30.length;
  const last30Accuracy =
    last30Answered === 0
      ? null
      : (last30.filter((row) => row.correct).length / last30Answered) * 100;

  let fullBreakdown: WeaknessEntry[] = [];
  const normalizedBreakdown = exam ? normalizeBreakdown(exam.breakdown) : null;

  if (normalizedBreakdown?.weaknesses?.length) {
    fullBreakdown = normalizedBreakdown.weaknesses;
  } else if (normalizedBreakdown?.attempts?.length) {
    fullBreakdown = computeWeaknesses(normalizedBreakdown.attempts);
  } else if (practiceResults.length > 0) {
    fullBreakdown = computeWeaknesses(practiceResults);
  }

  const visibleBreakdown = getWeaknessSummary(fullBreakdown, plan, fullAccess);
  const showDetail = canViewWeaknessDetail(plan);
  const hiddenCount = fullBreakdown.length - visibleBreakdown.length;

  return {
    plan,
    exam: exam
      ? { id: exam.id, score: exam.score, created_at: exam.created_at }
      : null,
    attempts,
    last7Answered,
    last7Accuracy,
    last30Answered,
    last30Accuracy,
    fullBreakdown,
    visibleBreakdown,
    showDetail,
    hiddenCount,
    hasPracticeResults: practiceResults.length > 0,
  };
}
