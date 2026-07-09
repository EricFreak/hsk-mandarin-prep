import Link from "next/link";
import UpgradeCTA from "@/components/paywall/UpgradeCTA";
import { planLabel, type Plan } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

type PracticeMistakeRow = {
  created_at: string;
  correct: boolean;
  skill: string;
  practice_question_id: string | null;
  practice_questions: PracticeQuestionSnapshot | PracticeQuestionSnapshot[] | null;
};

type PracticeQuestionSnapshot = {
  id: string;
  level: number;
  stem: string;
  choices: unknown;
  answer_index: number;
  explanation: string;
  skill: string;
};

function firstPracticeQuestion(
  value: PracticeMistakeRow["practice_questions"],
): PracticeQuestionSnapshot | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

type StoredMockAnswer = {
  questionId: string;
  section?: "listening" | "reading" | "writing";
  skill?: string;
  stem?: string;
  choices?: string[];
  answerIndex?: number;
  selectedIndex?: number;
};

function normalizeMockAnswers(raw: unknown): StoredMockAnswer[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as StoredMockAnswer[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as StoredMockAnswer[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function pillClass(active: boolean): string {
  return active
    ? "rounded-full bg-jade/10 px-3 py-1 text-xs font-semibold text-jade"
    : "rounded-full border border-mist bg-white px-3 py-1 text-xs font-semibold text-ink-muted hover:bg-paper-dark";
}

export default async function MistakesPage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string; type?: string }>;
}) {
  const params = await searchParams;
  const typeFilter = params.type === "mock" || params.type === "practice" ? params.type : "all";
  const skillFilter = typeof params.skill === "string" ? params.skill : "all";

  if (!hasSupabaseEnv()) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Mistake Bank</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Supabase is not configured. Connect your database to review mistakes.
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

  const practiceLimit = plan === "pro" ? 100 : 10;
  const mockLimit = plan === "pro" ? 25 : 5;

  const [{ data: practiceRows }, { data: mockRows }] = await Promise.all([
    supabase
      .from("practice_attempts")
      .select(
        "created_at, correct, skill, practice_question_id, practice_questions(id, level, stem, choices, answer_index, explanation, skill)",
      )
      .eq("user_id", user.id)
      .eq("correct", false)
      .order("created_at", { ascending: false })
      .limit(practiceLimit),
    supabase
      .from("mock_exam_attempts")
      .select("id, created_at, answers")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(mockLimit),
  ]);

  const practiceMistakes = (practiceRows ?? []) as unknown as PracticeMistakeRow[];

  const mockMistakes = (mockRows ?? []).flatMap((row) => {
    const answers = normalizeMockAnswers((row as { answers?: unknown }).answers);
    return answers
      .filter((answer) => {
        if (!answer.choices?.length) return false;
        if (answer.answerIndex === undefined) return false;
        if (answer.selectedIndex === undefined) return false;
        return answer.selectedIndex !== answer.answerIndex;
      })
      .map((answer) => ({
        type: "mock" as const,
        createdAt: (row as { created_at: string }).created_at,
        attemptId: (row as { id: string }).id,
        skill: answer.skill ?? "unknown",
        stem: answer.stem ?? "",
        choices: answer.choices ?? [],
        answerIndex: answer.answerIndex ?? 0,
        selectedIndex: answer.selectedIndex ?? 0,
        questionId: answer.questionId,
      }));
  });

  const allItems = [
    ...practiceMistakes
      .map((row) => ({ row, question: firstPracticeQuestion(row.practice_questions) }))
      .filter(({ question }) => Boolean(question))
      .map(({ row, question }) => ({
        type: "practice" as const,
        createdAt: row.created_at,
        skill: row.skill,
        questionId: question!.id,
        level: question!.level,
        stem: question!.stem,
        choices: isStringArray(question!.choices) ? question!.choices : [],
        answerIndex: question!.answer_index,
        explanation: question!.explanation,
      })),
    ...mockMistakes,
  ]
    .filter((item) => (typeFilter === "all" ? true : item.type === typeFilter))
    .filter((item) => (skillFilter === "all" ? true : item.skill === skillFilter))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const skills = Array.from(new Set(allItems.map((item) => item.skill))).filter(Boolean);

  const freeLocked = plan === "free";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Mistake Bank</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Review recent incorrect answers and practice them again.
          </p>
        </div>
        <div className="surface-card px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Plan</p>
          <p className="mt-1 font-display text-lg font-semibold text-ink">{planLabel(plan)}</p>
        </div>
      </div>

      {freeLocked ? (
        <div className="surface-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">Pro feature</h2>
              <p className="mt-2 text-sm text-ink-muted">
                Free accounts can preview your 10 most recent mistakes. Upgrade to Pro for a full
                mistake bank with filters and unlimited review.
              </p>
            </div>
            <Link href="/pricing" className="btn-primary">
              Upgrade
            </Link>
          </div>
        </div>
      ) : null}

      <div className="surface-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/mistakes?type=all${skillFilter !== "all" ? `&skill=${encodeURIComponent(skillFilter)}` : ""}`}
              className={pillClass(typeFilter === "all")}
            >
              All
            </Link>
            <Link
              href={`/mistakes?type=practice${skillFilter !== "all" ? `&skill=${encodeURIComponent(skillFilter)}` : ""}`}
              className={pillClass(typeFilter === "practice")}
            >
              Practice
            </Link>
            <Link
              href={`/mistakes?type=mock${skillFilter !== "all" ? `&skill=${encodeURIComponent(skillFilter)}` : ""}`}
              className={pillClass(typeFilter === "mock")}
            >
              Mock exam
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Skill
            </span>
            <Link
              href={`/mistakes?type=${typeFilter}`}
              className={pillClass(skillFilter === "all")}
            >
              All
            </Link>
            {skills.slice(0, plan === "pro" ? 6 : 3).map((skill) => (
              <Link
                key={skill}
                href={`/mistakes?type=${typeFilter}&skill=${encodeURIComponent(skill)}`}
                className={pillClass(skillFilter === skill)}
              >
                {skill}
              </Link>
            ))}
          </div>
        </div>

        {allItems.length === 0 ? (
          <p className="mt-6 text-sm text-ink-muted">
            No mistakes yet. Try{" "}
            <Link href="/practice" className="text-link">
              practice
            </Link>{" "}
            or a{" "}
            <Link href="/mock-exam" className="text-link">
              mock exam
            </Link>{" "}
            to start collecting review items.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {allItems.map((item, index) => (
              <div key={`${item.type}-${item.createdAt}-${index}`} className="rounded-xl border border-mist bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-jade">
                      {item.type === "practice" ? "Practice" : "Mock exam"}
                    </p>
                    <p className="mt-2 text-sm font-medium text-ink">
                      <span className="capitalize">{item.skill}</span>{" "}
                      <span className="text-ink-muted">·</span>{" "}
                      <span className="text-ink-muted">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                  </div>

                  {item.type === "practice" ? (
                    <Link
                      href={`/practice?questionId=${encodeURIComponent(item.questionId)}`}
                      className="btn-secondary"
                    >
                      Practice again
                    </Link>
                  ) : (
                    <Link
                      href={`/mock-exam/attempts/${encodeURIComponent(item.attemptId)}`}
                      className="btn-secondary"
                    >
                      Review attempt
                    </Link>
                  )}
                </div>

                <p className="mt-4 text-sm font-medium text-ink">{item.stem}</p>

                {"choices" in item && item.choices.length ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {item.choices.map((choice, choiceIndex) => {
                      const isCorrectChoice = item.answerIndex === choiceIndex;
                      const isSelected =
                        item.type === "mock" ? item.selectedIndex === choiceIndex : false;

                      const className = isCorrectChoice
                        ? "border-jade bg-jade/10 text-jade"
                        : isSelected
                          ? "border-seal bg-seal/10 text-seal"
                          : "border-mist bg-paper-dark text-ink";

                      return (
                        <div
                          key={`${choice}-${choiceIndex}`}
                          className={`rounded-lg border px-4 py-3 text-sm font-medium ${className}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span>{choice}</span>
                            {item.type === "mock" ? (
                              <span className="text-xs font-semibold uppercase tracking-wide">
                                {isCorrectChoice ? "Correct" : isSelected ? "Yours" : ""}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {item.type === "practice" ? (
                  <div className="mt-4 rounded-lg border border-jade/20 bg-jade/5 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Explanation
                    </p>
                    <p className="mt-2 text-sm text-ink">{item.explanation}</p>
                  </div>
                ) : null}
              </div>
            ))}

            {freeLocked ? (
              <div className="mt-6">
                <UpgradeCTA
                  title="Unlock your full mistake bank"
                  description="Upgrade to Pro to filter by skill/type and review unlimited mistakes."
                  className="text-left"
                />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

