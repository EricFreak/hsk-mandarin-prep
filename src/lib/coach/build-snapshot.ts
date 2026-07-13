import type { Plan } from "@/lib/entitlements";
import { computeWeaknesses, type AttemptResult } from "@/lib/weakness";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LearnerSnapshot, SnapshotMockExam } from "./types";

type MockExamRow = {
  id: string;
  score: number;
  created_at: string;
  breakdown: unknown;
  answers: unknown;
};

type PracticeRow = {
  skill: string;
  correct: boolean;
  created_at: string;
};

function sinceDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function normalizeBreakdown(breakdown: unknown): {
  attempts?: AttemptResult[];
  weaknesses?: { skill: string; wrongCount: number }[];
} | null {
  if (!breakdown) return null;
  if (typeof breakdown === "string") {
    try {
      return JSON.parse(breakdown) as {
        attempts?: AttemptResult[];
        weaknesses?: { skill: string; wrongCount: number }[];
      };
    } catch {
      return null;
    }
  }
  if (typeof breakdown === "object") {
    return breakdown as {
      attempts?: AttemptResult[];
      weaknesses?: { skill: string; wrongCount: number }[];
    };
  }
  return null;
}

function extractWritingSample(answers: unknown): string | undefined {
  if (!Array.isArray(answers)) return undefined;
  for (const item of answers) {
    if (
      item &&
      typeof item === "object" &&
      "writingText" in item &&
      typeof (item as { writingText?: string }).writingText === "string"
    ) {
      const text = (item as { writingText: string }).writingText.trim();
      if (text) return text.slice(0, 500);
    }
  }
  return undefined;
}

function toMockExamSnapshot(row: MockExamRow): SnapshotMockExam {
  const normalized = normalizeBreakdown(row.breakdown);
  let weaknesses = normalized?.weaknesses ?? [];
  if (!weaknesses.length && normalized?.attempts?.length) {
    weaknesses = computeWeaknesses(normalized.attempts);
  }

  return {
    id: row.id,
    score: row.score,
    date: row.created_at,
    weaknesses,
    writingSample: extractWritingSample(row.answers),
  };
}

export async function buildSnapshot(
  supabase: SupabaseClient,
  userId: string,
): Promise<LearnerSnapshot> {
  const since30 = sinceDays(30);
  const nowIso = new Date().toISOString();

  const [
    { data: profile },
    { data: learnerProfile },
    { data: mockExams },
    { data: practiceRows },
    { count: srsDueCount },
    { data: previousReport },
  ] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", userId).maybeSingle(),
    supabase
      .from("learner_profiles")
      .select("target_level, minutes_per_day, target_exam_date")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("mock_exam_attempts")
      .select("id, score, created_at, breakdown, answers")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("practice_attempts")
      .select("skill, correct, created_at")
      .eq("user_id", userId)
      .gte("created_at", since30)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("srs_cards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .lte("due_at", nowIso),
    supabase
      .from("coach_reports")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const plan: Plan = profile?.plan === "pro" ? "pro" : "free";
  const practice = (practiceRows ?? []) as PracticeRow[];
  const bySkill: Record<string, { answered: number; correct: number }> = {};

  for (const row of practice) {
    const bucket = bySkill[row.skill] ?? { answered: 0, correct: 0 };
    bucket.answered += 1;
    if (row.correct) bucket.correct += 1;
    bySkill[row.skill] = bucket;
  }

  const wrongBySkill = new Map<string, number>();
  for (const row of practice) {
    if (row.correct) continue;
    wrongBySkill.set(row.skill, (wrongBySkill.get(row.skill) ?? 0) + 1);
  }

  const mistakeHotspots = Array.from(wrongBySkill.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count);

  return {
    userId,
    plan,
    targetLevel: learnerProfile?.target_level ?? 3,
    targetExamDate: learnerProfile?.target_exam_date ?? null,
    minutesPerDay: learnerProfile?.minutes_per_day ?? null,
    mockExams: ((mockExams ?? []) as MockExamRow[]).map(toMockExamSnapshot),
    practiceLast30d: { bySkill },
    srsDueCount: srsDueCount ?? 0,
    mistakeHotspots,
    previousReportId: previousReport?.id,
  };
}

export async function ensureLearnerProfile(
  supabase: SupabaseClient,
  userId: string,
  targetLevel = 3,
): Promise<void> {
  const { data } = await supabase
    .from("learner_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) return;

  await supabase.from("learner_profiles").insert({
    user_id: userId,
    target_level: targetLevel,
  });
}
