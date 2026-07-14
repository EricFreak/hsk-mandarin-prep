import {
  canTakeMockExam,
  type Plan,
} from "@/lib/entitlements";
import {
  HSK3_DIAGNOSIS_EXAM,
  HSK3_DIAGNOSIS_MCQ_COUNT,
  HSK3_DIAGNOSIS_TEMPLATE_ID,
  HSK3_DIAGNOSIS_TEMPLATE_VERSION,
  isDiagnosisTemplateId,
} from "@/data/diagnosis/hsk3-diagnosis";
import {
  HSK3_MOCK_EXAM,
  HSK3_MOCK_EXAM_MCQ_COUNT,
  HSK3_MOCK_EXAM_TEMPLATE_ID,
  HSK3_MOCK_EXAM_TEMPLATE_VERSION,
  type MockExamQuestion,
} from "@/lib/mock-exam/hsk3-template";
import { computeWeaknesses } from "@/lib/weakness";
import { runCoach } from "@/lib/coach/run-coach";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function getAuthenticatedUser() {
  if (!hasSupabaseEnv()) {
    return {
      error: NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 503 },
      ),
    };
  }

  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { supabase, user };
}

async function getUserPlan(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<Plan> {
  const { data, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data?.plan) {
    return "free";
  }

  return data.plan === "pro" ? "pro" : "free";
}

async function countCompletedMockExams(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<number> {
  // Diagnosis / legacy placement must NOT consume the Free mock quota.
  const { count, error } = await supabase
    .from("mock_exam_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("template_id", "in", '("hsk3-diagnosis","hsk3-placement")');

  if (error) {
    // Fallback if filter unsupported: fetch and filter client-side.
    const { data, error: listError } = await supabase
      .from("mock_exam_attempts")
      .select("template_id")
      .eq("user_id", userId);
    if (listError) throw listError;
    return (data ?? []).filter(
      (row) =>
        row.template_id !== "hsk3-diagnosis" &&
        row.template_id !== "hsk3-placement",
    ).length;
  }

  return count ?? 0;
}

const answerSchema = z.object({
  questionId: z.string().min(1),
  selectedIndex: z.number().int().min(0).optional(),
  writingText: z.string().optional(),
});

const submitSchema = z.object({
  answers: z.array(answerSchema).min(1),
  startedAt: z.string().datetime().optional(),
  durationSeconds: z.number().int().min(0).max(60 * 60 * 8).optional(),
  templateId: z.string().optional(),
});

type ExamTemplate = {
  questions: MockExamQuestion[];
  templateId: string;
  templateVersion: number;
  mcqCount: number;
  skipFreemiumLimit: boolean;
};

function resolveExamTemplate(templateId?: string): ExamTemplate {
  if (isDiagnosisTemplateId(templateId)) {
    return {
      questions: HSK3_DIAGNOSIS_EXAM,
      templateId: HSK3_DIAGNOSIS_TEMPLATE_ID,
      templateVersion: HSK3_DIAGNOSIS_TEMPLATE_VERSION,
      mcqCount: HSK3_DIAGNOSIS_MCQ_COUNT,
      skipFreemiumLimit: true,
    };
  }

  return {
    questions: HSK3_MOCK_EXAM,
    templateId: HSK3_MOCK_EXAM_TEMPLATE_ID,
    templateVersion: HSK3_MOCK_EXAM_TEMPLATE_VERSION,
    mcqCount: HSK3_MOCK_EXAM_MCQ_COUNT,
    skipFreemiumLimit: false,
  };
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const examTemplate = resolveExamTemplate(parsed.data.templateId);
    const { questions, templateId, templateVersion, mcqCount, skipFreemiumLimit } =
      examTemplate;

    const [plan, completedExams] = await Promise.all([
      getUserPlan(supabase, user.id),
      countCompletedMockExams(supabase, user.id),
    ]);

    if (!skipFreemiumLimit && !canTakeMockExam(plan, completedExams)) {
      return NextResponse.json(
        { error: "limit_reached", upgrade: true },
        { status: 402 },
      );
    }

    const questionById = new Map(questions.map((q) => [q.id, q]));
    const attempts: { questionId: string; skill: string; correct: boolean }[] =
      [];
    let correctCount = 0;

    for (const answer of parsed.data.answers) {
      const question = questionById.get(answer.questionId);
      if (!question) {
        return NextResponse.json(
          { error: `Unknown question: ${answer.questionId}` },
          { status: 400 },
        );
      }

      if (question.section === "writing") {
        attempts.push({
          questionId: question.id,
          skill: question.skill,
          correct: Boolean(answer.writingText?.trim()),
        });
        continue;
      }

      if (answer.selectedIndex === undefined) {
        return NextResponse.json(
          { error: `Missing answer for question: ${question.id}` },
          { status: 400 },
        );
      }

      const correct = answer.selectedIndex === question.answerIndex;
      if (correct) correctCount += 1;

      attempts.push({
        questionId: question.id,
        skill: question.skill,
        correct,
      });
    }

    const score = Math.round((correctCount / mcqCount) * 100);
    const weaknesses = computeWeaknesses(attempts);

    const breakdown = {
      breakdown_version: 1,
      attempts,
      weaknesses,
      correctCount,
      totalMcq: mcqCount,
    };

    const completedAt = new Date().toISOString();
    const startedAt = parsed.data.startedAt;
    const durationSeconds = parsed.data.durationSeconds;

    const answersForReview = parsed.data.answers.map((answer) => {
      const question = questionById.get(answer.questionId);
      return {
        questionId: answer.questionId,
        section: question?.section,
        skill: question?.skill,
        stem: question?.stem,
        audioText: question?.audioText,
        choices: question?.choices,
        answerIndex: question?.answerIndex,
        selectedIndex: answer.selectedIndex,
        writingText: answer.writingText,
      };
    });

    const { data: inserted, error } = await supabase
      .from("mock_exam_attempts")
      .insert({
      user_id: user.id,
      level: 3,
      score,
      breakdown,
      template_id: templateId,
      template_version: templateVersion,
      answers: answersForReview,
      started_at: startedAt,
      completed_at: completedAt,
      duration_seconds: durationSeconds,
      status: "completed",
    })
      .select("id")
      .maybeSingle();

    if (error) {
      throw error;
    }

    const isDiagnosis = isDiagnosisTemplateId(templateId);
    if (isDiagnosis && inserted?.id) {
      const stampAt = completedAt;
      await supabase
        .from("learner_profiles")
        .update({
          diagnosis_completed_at: stampAt,
          coach_last_error: null,
          coach_last_run_at: stampAt,
          updated_at: stampAt,
        })
        .eq("user_id", user.id);

      // Server-owned coach trigger (do not rely only on client fire-and-forget).
      void runCoach(supabase, {
        userId: user.id,
        trigger: "mock_exam_completed",
        sourceAttemptId: inserted.id,
      }).catch(async (coachErr) => {
        console.error("Diagnosis coach run failed:", coachErr);
        try {
          await supabase
            .from("learner_profiles")
            .update({
              coach_last_error:
                coachErr instanceof Error
                  ? coachErr.message
                  : "Coach generation failed",
              coach_last_run_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
        } catch {
          // Column may be missing before migration 009.
        }
      });
    }

    return NextResponse.json({
      ok: true,
      attemptId: inserted?.id ?? null,
      score,
      correctCount,
      totalMcq: mcqCount,
      weaknesses,
      coachPending: Boolean(inserted?.id),
      diagnosisComplete: isDiagnosis,
    });
  } catch (err) {
    console.error("Mock exam submit failed:", err);
    return NextResponse.json(
      { error: "Failed to submit mock exam" },
      { status: 500 },
    );
  }
}
