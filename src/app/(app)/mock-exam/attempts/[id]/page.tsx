import Link from "next/link";
import SpeakChineseButton from "@/components/audio/SpeakChineseButton";
import PracticeStem from "@/components/practice/PracticeStem";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

type StoredAnswer = {
  questionId: string;
  section?: "listening" | "reading" | "writing";
  skill?: string;
  stem?: string;
  audioText?: string;
  choices?: string[];
  answerIndex?: number;
  selectedIndex?: number;
  writingText?: string;
  aiFeedback?: unknown;
};

type AttemptRow = {
  id: string;
  score: number;
  status: string | null;
  created_at: string;
  template_id: string | null;
  template_version: number | null;
  duration_seconds: number | null;
  answers: unknown;
  breakdown: unknown;
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

function normalizeAnswers(raw: unknown): StoredAnswer[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as StoredAnswer[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as StoredAnswer[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function labelSection(section?: string): string {
  if (!section) return "question";
  return section.charAt(0).toUpperCase() + section.slice(1);
}

export default async function MockExamAttemptDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  if (!hasSupabaseEnv()) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Mock exam review</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Supabase is not configured. Connect your database to review attempts.
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

  const { data } = await supabase
    .from("mock_exam_attempts")
    .select(
      "id, score, status, created_at, template_id, template_version, duration_seconds, answers, breakdown",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  const attempt = data as AttemptRow | null;
  if (!attempt) notFound();

  const answers = normalizeAnswers(attempt.answers);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Mock exam review</h1>
          <p className="mt-2 text-sm text-ink-muted">
            HSK 3 · {formatDateTime(attempt.created_at)}
            {attempt.template_version ? (
              <>
                {" "}
                <span className="text-ink-muted">·</span> v{attempt.template_version}
              </>
            ) : null}
          </p>
          {attempt.duration_seconds ? (
            <p className="mt-1 text-xs text-ink-muted">
              Duration: {Math.round(attempt.duration_seconds / 60)} min
            </p>
          ) : null}
        </div>
        <div className="rounded-xl border border-jade/20 bg-jade/5 px-6 py-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Score</p>
          <p className="mt-1 font-display text-3xl font-semibold text-jade">{attempt.score}%</p>
        </div>
      </div>

      {answers.length === 0 ? (
        <div className="surface-card p-6">
          <h2 className="text-sm font-semibold text-ink">No saved answers</h2>
          <p className="mt-2 text-sm text-ink-muted">
            This attempt was saved before answer storage was added. New attempts will include full
            per-question review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {answers.map((answer, index) => {
            const isWriting = answer.section === "writing";
            const isMcq = !isWriting && Array.isArray(answer.choices) && answer.choices.length > 0;
            const correctIndex = answer.answerIndex;
            const selectedIndex = answer.selectedIndex;
            const isCorrect =
              isMcq && selectedIndex !== undefined && correctIndex !== undefined
                ? selectedIndex === correctIndex
                : undefined;

            return (
              <div key={`${answer.questionId}-${index}`} className="surface-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-jade">
                      {labelSection(answer.section)}
                    </p>
                    <p className="mt-2 text-sm font-medium text-ink">
                      Question {index + 1}
                      {answer.skill ? (
                        <>
                          {" "}
                          <span className="text-ink-muted">·</span>{" "}
                          <span className="capitalize text-ink-muted">{answer.skill}</span>
                        </>
                      ) : null}
                    </p>
                  </div>
                  {typeof isCorrect === "boolean" ? (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        isCorrect ? "bg-jade/10 text-jade" : "bg-seal/10 text-seal"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  ) : null}
                </div>

                {answer.section === "listening" && answer.audioText ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-jade/20 bg-jade/5 px-4 py-3">
                      <span className="text-sm font-medium text-ink">Replay audio</span>
                      <SpeakChineseButton text={answer.audioText} />
                    </div>
                    <div className="rounded-lg border border-mist bg-paper-dark px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Transcript
                      </p>
                      <p className="mt-2 text-sm text-ink">{answer.audioText}</p>
                    </div>
                    {answer.stem ? (
                      <p className="text-base font-medium text-ink">{answer.stem}</p>
                    ) : null}
                  </div>
                ) : answer.section === "reading" && answer.stem ? (
                  <div className="mt-4">
                    <PracticeStem stem={answer.stem} />
                  </div>
                ) : answer.stem ? (
                  <p className="mt-4 whitespace-pre-line text-base font-medium text-ink">
                    {answer.stem}
                  </p>
                ) : null}

                {isWriting ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Your response
                      </p>
                      <div className="mt-2 rounded-lg border border-mist bg-paper-dark px-4 py-3">
                        <p className="whitespace-pre-wrap text-sm text-ink">
                          {answer.writingText?.trim() ? answer.writingText : "—"}
                        </p>
                      </div>
                    </div>

                    {answer.aiFeedback ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          AI feedback
                        </p>
                        <div className="mt-2 rounded-lg border border-jade/20 bg-jade/5 px-4 py-3">
                          <pre className="whitespace-pre-wrap text-xs text-ink-muted">
                            {typeof answer.aiFeedback === "string"
                              ? answer.aiFeedback
                              : JSON.stringify(answer.aiFeedback, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : isMcq && answer.choices ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {answer.choices.map((choice, choiceIndex) => {
                      const isSelected = selectedIndex === choiceIndex;
                      const isCorrectChoice = correctIndex === choiceIndex;

                      const className = isCorrectChoice
                        ? "border-jade bg-jade/10 text-jade"
                        : isSelected
                          ? "border-seal bg-seal/10 text-seal"
                          : "border-mist bg-white text-ink";

                      return (
                        <div
                          key={`${answer.questionId}-${choiceIndex}`}
                          className={`rounded-lg border px-4 py-3 text-sm font-medium ${className}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span>{choice}</span>
                            <span className="text-xs font-semibold uppercase tracking-wide">
                              {isCorrectChoice ? "Correct" : isSelected ? "Yours" : ""}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/mock-exam/attempts" className="btn-secondary">
          Back to attempts
        </Link>
        <Link href="/mock-exam" className="btn-primary">
          Take another exam
        </Link>
      </div>
    </div>
  );
}

