"use client";

import PracticeStem from "@/components/practice/PracticeStem";
import LoadingPulse, { AsyncOverlay } from "@/components/ui/LoadingPulse";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type PracticeQuestion = {
  stem: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  skill: string;
};

type GenerateResponse = {
  questionId: string;
  question: PracticeQuestion;
  level: 1 | 2 | 3;
  usedToday: number;
  limit: number | null;
  reviewOnly?: boolean;
  error?: string;
  upgrade?: boolean;
};

const LEVELS = [1, 2, 3] as const;

export default function PracticeSession() {
  const searchParams = useSearchParams();
  const [level, setLevel] = useState<1 | 2 | 3>(3);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [reviewOnly, setReviewOnly] = useState(false);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [usedToday, setUsedToday] = useState(0);
  const [limit, setLimit] = useState<number | null>(20);
  const questionSeedRef = useRef(0);

  const loadQuestion = useCallback(async (targetLevel: 1 | 2 | 3) => {
    questionSeedRef.current += 1;
    const seed = questionSeedRef.current;
    setLoading(true);
    setError(null);
    setLimitReached(false);
    setReviewOnly(false);
    setSelectedIndex(null);
    setSubmitted(false);
    // Keep the current question visible while the next one generates.

    try {
      const replayQuestionId = searchParams.get("questionId");
      const focusSkill = searchParams.get("skill");
      const params = new URLSearchParams();
      if (replayQuestionId) {
        params.set("questionId", replayQuestionId);
      } else {
        params.set("level", String(targetLevel));
        params.set("seed", String(seed));
        if (focusSkill) {
          params.set("skill", focusSkill);
        }
      }
      const response = await fetch(`/api/practice/generate?${params.toString()}`);
      const data = (await response.json()) as GenerateResponse;

      if (response.status === 402 && data.error === "limit_reached") {
        setLimitReached(true);
        setQuestion(null);
        return;
      }

      if (!response.ok) {
        setError(data.error ?? "Failed to load practice question");
        return;
      }

      setQuestionId(data.questionId);
      setQuestion(data.question);
      setUsedToday(data.usedToday);
      setLimit(data.limit);
      setReviewOnly(Boolean(data.reviewOnly));
    } catch {
      setError("Failed to load practice question");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    void loadQuestion(level);
  }, [level, loadQuestion]);

  async function handleSubmit() {
    if (!question || questionId === null || selectedIndex === null || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const correct = selectedIndex === question.answerIndex;

    try {
      if (reviewOnly) {
        setSubmitted(true);
        return;
      }

      const response = await fetch("/api/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          correct,
          skill: question.skill,
          level,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        upgrade?: boolean;
        usedToday?: number;
        limitReached?: boolean;
      };

      if (response.status === 402 && data.error === "limit_reached") {
        setLimitReached(true);
        return;
      }

      if (!response.ok) {
        setError(data.error ?? "Failed to submit answer");
        return;
      }

      setSubmitted(true);
      if (typeof data.usedToday === "number") {
        setUsedToday(data.usedToday);
      }
      if (data.limitReached) {
        setLimitReached(true);
      }

      const planTaskId = searchParams.get("planTaskId");
      if (planTaskId && correct) {
        void fetch(`/api/coach/plan/tasks/${planTaskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "done" }),
        });
      }
    } catch {
      setError("Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  }

  if (limitReached) {
    return (
      <div className="alert-limit">
        <h2 className="font-display text-lg font-semibold text-ink">Daily limit reached</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Free accounts include 20 AI practice questions per day. Upgrade to Pro for
          unlimited practice.
        </p>
        <Link
          href="/pricing"
          className="mt-6 inline-block btn-primary"
        >
          View pricing
        </Link>
      </div>
    );
  }

  if (loading && !question) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-ink">HSK level</span>
            {LEVELS.map((value) => (
              <button
                key={value}
                type="button"
                disabled
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  level === value
                    ? "bg-jade text-white"
                    : "border border-mist bg-white text-ink-muted"
                } opacity-60`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <div className="surface-card relative flex min-h-[280px] items-center justify-center p-8">
          <LoadingPulse label="Generating your first question…" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-seal/20 bg-seal/5 p-6 text-center">
        <p className="text-sm text-seal">{error}</p>
        <button
          type="button"
          onClick={() => void loadQuestion(level)}
          className="mt-4 btn-primary"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  const isCorrect = selectedIndex === question.answerIndex;

  const focusSkill = searchParams.get("skill");
  const planTaskId = searchParams.get("planTaskId");

  return (
    <div className="relative space-y-6">
      <AsyncOverlay active={loading} label="Generating next question…" />
      {focusSkill ? (
        <div className="rounded-lg border border-jade/30 bg-jade/5 px-4 py-3 text-sm text-ink-muted">
          Today&apos;s focus:{" "}
          <span className="font-semibold capitalize text-jade">{focusSkill}</span>
          {planTaskId ? " (from your coach plan)" : ""}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink">HSK level</span>
          {LEVELS.map((value) => (
            <button
              key={value}
              type="button"
              disabled={loading || submitting || submitted}
              onClick={() => {
                if (value !== level) {
                  setLevel(value);
                }
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                level === value
                  ? "bg-jade text-white"
                  : "border border-mist bg-white text-ink-muted hover:bg-paper-dark"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {value}
            </button>
          ))}
        </div>
        {limit !== null ? (
          <p className="text-sm text-ink-muted">
            {usedToday}/{limit} questions today
          </p>
        ) : null}
      </div>

      <div className="surface-card p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-jade">
          {question.skill}
        </p>
        <PracticeStem stem={question.stem} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {question.choices.map((choice, index) => {
          let choiceClass =
            "rounded-lg border px-4 py-3 text-left text-sm font-medium transition";

          if (submitted) {
            if (index === question.answerIndex) {
              choiceClass += " border-jade bg-jade/10 text-jade";
            } else if (index === selectedIndex) {
              choiceClass += " border-seal bg-seal/10 text-seal";
            } else {
              choiceClass += " border-mist bg-white text-ink-muted";
            }
          } else if (selectedIndex === index) {
            choiceClass += " border-jade bg-jade/10 text-jade";
          } else {
            choiceClass += " border-mist bg-white text-ink hover:border-jade/30";
          }

          return (
            <button
              key={`${choice}-${index}`}
              type="button"
              disabled={submitting || submitted}
              onClick={() => setSelectedIndex(index)}
              className={choiceClass}
            >
              {choice}
            </button>
          );
        })}
      </div>

      {submitted ? (
        <div
          className={`rounded-lg border p-4 ${
            isCorrect
              ? "border-jade/30 bg-jade/10 text-ink"
              : "border-seal/30 bg-seal/10 text-ink"
          }`}
        >
          <p className="font-medium">{isCorrect ? "Correct!" : "Not quite."}</p>
          <p className="mt-2 text-sm">{question.explanation}</p>
          {reviewOnly ? (
            <Link href="/practice" className="mt-4 inline-block btn-primary">
              Back to practice
            </Link>
          ) : (
            <button
              type="button"
              disabled={limitReached}
              onClick={() => void loadQuestion(level)}
              className="mt-4 btn-primary"
            >
              Next question
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={selectedIndex === null || submitting}
          onClick={() => void handleSubmit()}
          className="w-full btn-primary py-3 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit answer"}
        </button>
      )}
    </div>
  );
}
