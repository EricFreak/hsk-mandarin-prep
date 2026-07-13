"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SpeakChineseButton from "@/components/audio/SpeakChineseButton";
import PracticeStem from "@/components/practice/PracticeStem";
import UpgradeCTA from "@/components/paywall/UpgradeCTA";
import { canUseAiWritingScore, type Plan } from "@/lib/entitlements";
import {
  HSK3_MOCK_EXAM,
  HSK3_MOCK_EXAM_MCQ_COUNT,
  HSK3_MOCK_EXAM_TEMPLATE_ID,
  HSK3_MOCK_EXAM_TEMPLATE_VERSION,
  type MockExamQuestion,
} from "@/lib/mock-exam/hsk3-template";
import type { WritingScoreResult } from "@/lib/openai/writing-score";
import type { WeaknessEntry } from "@/lib/weakness";

type ExamConfig = {
  questions: MockExamQuestion[];
  templateId: string;
  templateVersion: number;
  mcqCount: number;
};

const DEFAULT_EXAM: ExamConfig = {
  questions: HSK3_MOCK_EXAM,
  templateId: HSK3_MOCK_EXAM_TEMPLATE_ID,
  templateVersion: HSK3_MOCK_EXAM_TEMPLATE_VERSION,
  mcqCount: HSK3_MOCK_EXAM_MCQ_COUNT,
};

type AnswerState = {
  selectedIndex?: number;
  writingText?: string;
};

type SubmitResponse = {
  attemptId?: string | null;
  score?: number;
  correctCount?: number;
  totalMcq?: number;
  weaknesses?: WeaknessEntry[];
  coachPending?: boolean;
  error?: string;
  upgrade?: boolean;
};

type MockExamSessionProps = {
  plan?: Plan;
  exam?: ExamConfig;
  completePrimaryHref?: string;
  completePrimaryLabel?: string;
  hideReviewLink?: boolean;
};

export default function MockExamSession({
  plan = "free",
  exam = DEFAULT_EXAM,
  completePrimaryHref = "/dashboard",
  completePrimaryLabel = "View dashboard",
  hideReviewLink = false,
}: MockExamSessionProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [startedAt] = useState(() => new Date().toISOString());
  const [writingScore, setWritingScore] = useState<WritingScoreResult | null>(null);
  const [writingScoreLoading, setWritingScoreLoading] = useState(false);
  const [writingScoreError, setWritingScoreError] = useState<string | null>(null);
  const [coachStatus, setCoachStatus] = useState<"idle" | "running" | "ready" | "error">("idle");

  const { questions, templateId, mcqCount } = exam;
  const writingQuestion = questions.find((q) => q.section === "writing");

  const canScoreWriting = canUseAiWritingScore(plan);
  const writingAnswer = writingQuestion
    ? answers[writingQuestion.id]?.writingText?.trim()
    : undefined;

  const question = questions[step];
  const isLast = step === questions.length - 1;
  const currentAnswer = answers[question.id] ?? {};

  function updateAnswer(questionId: string, update: AnswerState) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], ...update },
    }));
  }

  function canAdvance(q: MockExamQuestion): boolean {
    const answer = answers[q.id];
    if (q.section === "writing") {
      return Boolean(answer?.writingText?.trim());
    }
    return answer?.selectedIndex !== undefined;
  }

  async function handleSubmit() {
    if (!canAdvance(question) || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const durationSeconds = Math.max(
        0,
        Math.round((Date.now() - new Date(startedAt).getTime()) / 1000),
      );
      const payload = {
        answers: questions.map((q) => ({
          questionId: q.id,
          selectedIndex: answers[q.id]?.selectedIndex,
          writingText: answers[q.id]?.writingText,
        })),
        startedAt,
        durationSeconds,
        templateId,
      };

      const response = await fetch("/api/mock-exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as SubmitResponse;

      if (response.status === 402 && data.error === "limit_reached") {
        setError("limit_reached");
        return;
      }

      if (!response.ok) {
        setError(data.error ?? "Failed to submit mock exam");
        return;
      }

      setResult(data);

      if (data.coachPending && data.attemptId) {
        setCoachStatus("running");
        void fetch("/api/coach/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trigger: "mock_exam_completed",
            sourceAttemptId: data.attemptId,
          }),
        })
          .then(async (response) => {
            if (response.ok) {
              setCoachStatus("ready");
              return;
            }
            setCoachStatus("error");
          })
          .catch(() => {
            setCoachStatus("error");
          });
      }
    } catch {
      setError("Failed to submit mock exam");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (!canAdvance(question)) return;
    if (isLast) {
      void handleSubmit();
      return;
    }
    setStep((prev) => prev + 1);
  }

  function handleBack() {
    if (step > 0) setStep((prev) => prev - 1);
  }

  useEffect(() => {
    if (!result || !canScoreWriting || !writingQuestion || !writingAnswer) {
      return;
    }

    const prompt = writingQuestion.stem;
    let cancelled = false;

    async function fetchWritingScore() {
      setWritingScoreLoading(true);
      setWritingScoreError(null);

      try {
        const response = await fetch("/api/writing/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            userText: writingAnswer,
          }),
        });

        const data = (await response.json()) as WritingScoreResult & {
          upgrade?: boolean;
          error?: string;
        };

        if (cancelled) return;

        if (response.status === 403 && data.upgrade) {
          setWritingScoreError("upgrade_required");
          return;
        }

        if (!response.ok) {
          setWritingScoreError(data.error ?? "Failed to score writing response");
          return;
        }

        setWritingScore(data);
      } catch {
        if (!cancelled) {
          setWritingScoreError("Failed to score writing response");
        }
      } finally {
        if (!cancelled) {
          setWritingScoreLoading(false);
        }
      }
    }

    void fetchWritingScore();

    return () => {
      cancelled = true;
    };
  }, [result, canScoreWriting, writingAnswer, writingQuestion]);

  if (error === "limit_reached") {
    return (
      <UpgradeCTA
        title="Mock exam limit reached"
        description="Free accounts include one HSK 3 mock exam. Upgrade to Pro for unlimited mock exams and detailed weakness reports."
      />
    );
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-jade/20 bg-jade/5 p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-ink">Exam complete</h2>
          <p className="mt-2 font-display text-4xl font-semibold text-jade">{result.score}%</p>
          <p className="mt-2 text-sm text-ink-muted">
            {result.correctCount}/{result.totalMcq ?? mcqCount} multiple-choice
            questions correct
          </p>
        </div>

        {result.weaknesses && result.weaknesses.length > 0 ? (
          <div className="surface-card p-6">
            <h3 className="text-sm font-semibold text-ink">Areas to improve</h3>
            <ul className="mt-3 space-y-2">
              {result.weaknesses.map((entry) => (
                <li key={entry.skill} className="text-sm text-ink-muted">
                  <span className="font-medium capitalize">{entry.skill}</span> —{" "}
                  {entry.wrongCount} incorrect
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="surface-card p-6 text-sm text-ink-muted">
            Great work — no major skill gaps detected on this attempt.
          </div>
        )}

        {writingQuestion && writingAnswer ? (
          <div className="surface-card p-6">
            <h3 className="text-sm font-semibold text-ink">AI writing feedback</h3>
            <p className="mt-1 text-xs text-ink-muted">
              Pro feature — personalized score and suggestions for your writing response.
            </p>

            {canScoreWriting ? (
              <div className="mt-4 space-y-4">
                {writingScoreLoading ? (
                  <p className="text-sm text-ink-muted">Analyzing your writing...</p>
                ) : writingScoreError ? (
                  <p className="text-sm text-red-600">{writingScoreError}</p>
                ) : writingScore ? (
                  <>
                    <p className="text-3xl font-bold text-jade">
                      {writingScore.score}
                      <span className="text-base font-medium text-ink-muted"> / 100</span>
                    </p>

                    {writingScore.grammarNotes.length > 0 ? (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Grammar
                        </h4>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
                          {writingScore.grammarNotes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {writingScore.vocabularyNotes.length > 0 ? (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Vocabulary
                        </h4>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
                          {writingScore.vocabularyNotes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {writingScore.suggestions.length > 0 ? (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Suggestions
                        </h4>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
                          {writingScore.suggestions.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            ) : (
              <div className="relative mt-4">
                <div className="pointer-events-none select-none space-y-4 blur-sm">
                  <p className="text-3xl font-bold text-jade">
                    82<span className="text-base font-medium text-ink-muted"> / 100</span>
                  </p>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Grammar
                    </h4>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
                      <li>Good use of 因为…所以… to explain your reason.</li>
                      <li>Watch particle placement for more natural flow.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Suggestions
                    </h4>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-muted">
                      <li>Add a specific example of when you do this sport.</li>
                      <li>Expand your answer with more HSK 3 vocabulary.</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <UpgradeCTA
                    title="Unlock AI writing feedback"
                    description="Upgrade to Pro for an instant AI score, grammar notes, vocabulary feedback, and personalized suggestions on your writing responses."
                    className="text-left"
                  />
                </div>
              </div>
            )}
          </div>
        ) : null}

        {coachStatus !== "idle" ? (
          <div className="surface-card p-6">
            <h3 className="text-sm font-semibold text-ink">AI coach report</h3>
            {coachStatus === "running" ? (
              <p className="mt-2 text-sm text-ink-muted">
                Generating your personalized summary and study plan…
              </p>
            ) : coachStatus === "ready" ? (
              <p className="mt-2 text-sm text-ink-muted">
                Your coach report is ready on the dashboard.
              </p>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">
                Report generation is delayed. Open your dashboard to retry shortly.
              </p>
            )}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {result.attemptId && !hideReviewLink ? (
            <Link href={`/mock-exam/attempts/${result.attemptId}`} className="btn-primary">
              Review exam
            </Link>
          ) : null}
          <Link
            href={completePrimaryHref}
            className={result.attemptId && !hideReviewLink ? "btn-secondary" : "btn-primary"}
          >
            {completePrimaryLabel}
          </Link>
          <Link
            href="/practice"
            className="btn-secondary"
          >
            Practice weak areas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-ink-muted">
        <span>
          Question {step + 1} of {questions.length}
        </span>
        <span className="capitalize">{question.section}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-mist">
        <div
          className="h-full rounded-full bg-jade transition-all"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-label="Exam progress"
        />
      </div>

      <div className="surface-card p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-jade">
          {question.skill}
        </p>

        {question.section === "listening" && question.audioText ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-ink-muted">
              Listen to the audio, then answer the question below. The Chinese
              transcript is hidden during the exam.
            </p>
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-jade/20 bg-jade/5 px-4 py-3">
              <span className="text-sm font-medium text-ink">Listening audio</span>
              <SpeakChineseButton text={question.audioText} />
            </div>
            <p className="text-xl font-medium text-ink">{question.stem}</p>
          </div>
        ) : question.section === "reading" ? (
          <PracticeStem stem={question.stem} />
        ) : (
          <p className="mt-4 whitespace-pre-line text-xl font-medium text-ink">
            {question.stem}
          </p>
        )}
      </div>

      {question.section === "writing" ? (
        <textarea
          value={currentAnswer.writingText ?? ""}
          onChange={(event) =>
            updateAnswer(question.id, { writingText: event.target.value })
          }
          rows={6}
          placeholder="Write your answer in Chinese..."
          className="input-field"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {question.choices?.map((choice, index) => (
            <button
              key={`${choice}-${index}`}
              type="button"
              onClick={() => updateAnswer(question.id, { selectedIndex: index })}
              className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                currentAnswer.selectedIndex === index
                  ? "border-jade bg-jade/10 text-jade"
                  : "border-mist bg-white text-ink hover:border-jade/30"
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
      )}

      {error && error !== "limit_reached" ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={step === 0 || submitting}
          onClick={handleBack}
          className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canAdvance(question) || submitting}
          onClick={handleNext}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Submitting..."
            : isLast
              ? "Submit exam"
              : "Next question"}
        </button>
      </div>
    </div>
  );
}
