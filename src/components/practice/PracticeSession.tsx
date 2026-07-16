"use client";

import MasteryGateResult from "@/components/practice/MasteryGateResult";
import PracticeStem from "@/components/practice/PracticeStem";
import LoadingPulse, { AsyncOverlay } from "@/components/ui/LoadingPulse";
import { evaluateMasteryGate } from "@/lib/coach/journey/mastery-gate";
import type { Plan } from "@/lib/entitlements";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

type PlanTaskInfo = {
  id: string;
  title: string;
  skill: string | null;
  task_type: string;
  status: string;
  target_count: number;
  attempted_count: number;
  completed_at: string | null;
  mastery_status: string | null;
  mastery_score: number | null;
};

const PRACTICE_LEVEL = 3 as const;
const DEFAULT_TARGET = 10;

function progressStorageKey(taskId: string) {
  return `hsk-plan-task-progress:${taskId}`;
}

function readLocalProgress(
  taskId: string,
): {
  attempted: number;
  target: number;
  correct?: number;
  answered?: number;
  hintAssistedCorrect?: number;
} | null {
  try {
    const raw = localStorage.getItem(progressStorageKey(taskId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      attempted?: number;
      target?: number;
      correct?: number;
      answered?: number;
      hintAssistedCorrect?: number;
    };
    if (typeof parsed.attempted !== "number") return null;
    return {
      attempted: Math.max(0, parsed.attempted),
      target:
        typeof parsed.target === "number" && parsed.target > 0
          ? parsed.target
          : DEFAULT_TARGET,
      correct: typeof parsed.correct === "number" ? Math.max(0, parsed.correct) : undefined,
      answered: typeof parsed.answered === "number" ? Math.max(0, parsed.answered) : undefined,
      hintAssistedCorrect:
        typeof parsed.hintAssistedCorrect === "number"
          ? Math.max(0, parsed.hintAssistedCorrect)
          : undefined,
    };
  } catch {
    return null;
  }
}

function writeLocalProgress(
  taskId: string,
  attempted: number,
  target: number,
  stats?: { correct: number; answered: number; hintAssistedCorrect: number },
) {
  try {
    localStorage.setItem(
      progressStorageKey(taskId),
      JSON.stringify({
        attempted,
        target,
        correct: stats?.correct,
        answered: stats?.answered,
        hintAssistedCorrect: stats?.hintAssistedCorrect,
        updatedAt: Date.now(),
      }),
    );
  } catch {
    // ignore quota / private mode
  }
}

type Props = {
  userPlan?: Plan;
};

export default function PracticeSession({ userPlan = "free" }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planTaskId = searchParams.get("planTaskId");
  const focusSkill = searchParams.get("skill");
  const isPlanSession = Boolean(planTaskId);

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
  const [limit, setLimit] = useState<number | null>(userPlan === "pro" ? null : 20);
  const [planTitle, setPlanTitle] = useState<string | null>(null);
  const [planTaskType, setPlanTaskType] = useState<string>("practice");
  const [targetCount, setTargetCount] = useState(DEFAULT_TARGET);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [showMasteryGate, setShowMasteryGate] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [hintAssistedCorrect, setHintAssistedCorrect] = useState(0);
  const [gateSaving, setGateSaving] = useState(false);
  const [savedMasteryStatus, setSavedMasteryStatus] = useState<string | null>(null);
  const [savedMasteryScore, setSavedMasteryScore] = useState<number | null>(null);
  const [taskDone, setTaskDone] = useState(false);
  const [savingExit, setSavingExit] = useState(false);
  const questionSeedRef = useRef(0);

  const progressPct = useMemo(
    () => Math.min(100, Math.round((attemptedCount / Math.max(targetCount, 1)) * 100)),
    [attemptedCount, targetCount],
  );

  const syncProgress = useCallback(
    (
      attempted: number,
      target: number,
      title?: string | null,
      stats?: { correct: number; answered: number; hintAssistedCorrect: number },
    ) => {
      setAttemptedCount(attempted);
      setTargetCount(target);
      if (title) setPlanTitle(title);
      if (planTaskId) {
        writeLocalProgress(
          planTaskId,
          attempted,
          target,
          stats ?? {
            correct: sessionCorrect,
            answered: sessionAnswered,
            hintAssistedCorrect,
          },
        );
      }
      if (planTaskId && attempted >= target) setShowMasteryGate(true);
    },
    [planTaskId, sessionCorrect, sessionAnswered, hintAssistedCorrect],
  );

  const masteryResult = useMemo(() => {
    if (
      savedMasteryStatus === "passed" ||
      savedMasteryStatus === "challenged"
    ) {
      return {
        outcome: savedMasteryStatus as "passed" | "challenged",
        displayScore: savedMasteryScore,
        displayMax: savedMasteryScore !== null ? 10 : null,
        effectiveAccuracy: null,
      };
    }
    return evaluateMasteryGate({
      correct: sessionCorrect,
      answered: sessionAnswered,
      hintAssistedCorrect,
      taskType: planTaskType,
    });
  }, [
    sessionCorrect,
    sessionAnswered,
    hintAssistedCorrect,
    planTaskType,
    savedMasteryStatus,
    savedMasteryScore,
  ]);

  const loadPlanTask = useCallback(async () => {
    if (!planTaskId) return;

    const local = readLocalProgress(planTaskId);
    if (local) {
      if (typeof local.correct === "number") setSessionCorrect(local.correct);
      if (typeof local.answered === "number") setSessionAnswered(local.answered);
      if (typeof local.hintAssistedCorrect === "number") {
        setHintAssistedCorrect(local.hintAssistedCorrect);
      }
      syncProgress(local.attempted, local.target, undefined, {
        correct: local.correct ?? 0,
        answered: local.answered ?? 0,
        hintAssistedCorrect: local.hintAssistedCorrect ?? 0,
      });
    }

    try {
      const response = await fetch(`/api/coach/plan/tasks/${planTaskId}`);
      if (!response.ok) return;
      const data = (await response.json()) as { task: PlanTaskInfo };
      const target = data.task.target_count > 0 ? data.task.target_count : DEFAULT_TARGET;
      const serverAttempted = data.task.attempted_count ?? 0;
      const attempted = Math.max(serverAttempted, local?.attempted ?? 0);
      setPlanTaskType(data.task.task_type);
      setSavedMasteryStatus(data.task.mastery_status);
      setSavedMasteryScore(data.task.mastery_score);
      syncProgress(attempted, target, data.task.title, {
        correct: local?.correct ?? 0,
        answered: local?.answered ?? 0,
        hintAssistedCorrect: local?.hintAssistedCorrect ?? 0,
      });
      setTaskDone(data.task.status === "done");
      if (data.task.status === "done") setShowMasteryGate(true);
    } catch {
      // local progress already applied
    }
  }, [planTaskId, syncProgress]);

  const persistProgress = useCallback(
    async (nextAttempted: number, target: number) => {
      if (!planTaskId) return;
      syncProgress(nextAttempted, target);
      try {
        await fetch(`/api/coach/plan/tasks/${planTaskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptedCount: nextAttempted }),
        });
      } catch {
        // localStorage already holds progress
      }
    },
    [planTaskId, syncProgress],
  );

  const loadQuestion = useCallback(async () => {
    questionSeedRef.current += 1;
    const seed = questionSeedRef.current;
    setLoading(true);
    setError(null);
    setLimitReached(false);
    setReviewOnly(false);
    setSelectedIndex(null);
    setSubmitted(false);

    try {
      const replayQuestionId = searchParams.get("questionId");
      const params = new URLSearchParams();
      if (replayQuestionId) {
        params.set("questionId", replayQuestionId);
      } else {
        params.set("level", String(PRACTICE_LEVEL));
        params.set("seed", String(seed));
        if (focusSkill) params.set("skill", focusSkill);
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
  }, [searchParams, focusSkill]);

  useEffect(() => {
    void loadPlanTask();
  }, [loadPlanTask]);

  useEffect(() => {
    void loadQuestion();
  }, [loadQuestion]);

  async function handleSubmit() {
    if (!question || questionId === null || selectedIndex === null || submitting) return;

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
          level: PRACTICE_LEVEL,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
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
      if (typeof data.usedToday === "number") setUsedToday(data.usedToday);
      if (data.limitReached) setLimitReached(true);

      if (isPlanSession) {
        const nextCorrect = sessionCorrect + (correct ? 1 : 0);
        const nextAnswered = sessionAnswered + 1;
        setSessionAnswered(nextAnswered);
        if (correct) setSessionCorrect(nextCorrect);
        const next = attemptedCount + 1;
        syncProgress(next, targetCount, undefined, {
          correct: nextCorrect,
          answered: nextAnswered,
          hintAssistedCorrect,
        });
        await persistProgress(next, targetCount);
      }
    } catch {
      setError("Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveAndExit() {
    setSavingExit(true);
    try {
      if (planTaskId) {
        writeLocalProgress(planTaskId, attemptedCount, targetCount, {
          correct: sessionCorrect,
          answered: sessionAnswered,
          hintAssistedCorrect,
        });
        try {
          await fetch(`/api/coach/plan/tasks/${planTaskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ attemptedCount }),
          });
        } catch {
          // local save is enough to resume
        }
      }
      router.push("/dashboard");
    } finally {
      setSavingExit(false);
    }
  }

  async function handlePracticeAgain() {
    if (!planTaskId) return;
    setGateSaving(true);
    try {
      await fetch(`/api/coach/plan/tasks/${planTaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptedCount: 0, mastery_status: "not_yet" }),
      });
      setSessionCorrect(0);
      setSessionAnswered(0);
      setHintAssistedCorrect(0);
      setAttemptedCount(0);
      setSavedMasteryStatus("not_yet");
      setSavedMasteryScore(null);
      setShowMasteryGate(false);
      writeLocalProgress(planTaskId, 0, targetCount, {
        correct: 0,
        answered: 0,
        hintAssistedCorrect: 0,
      });
      await loadQuestion();
    } finally {
      setGateSaving(false);
    }
  }

  async function handleContinueWeek() {
    if (!planTaskId) return;
    if (taskDone) {
      router.push("/dashboard");
      return;
    }
    setGateSaving(true);
    try {
      const masteryStatus =
        masteryResult.outcome === "challenged" ? "challenged" : "passed";
      await fetch(`/api/coach/plan/tasks/${planTaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "done",
          mastery_status: masteryStatus,
          mastery_score: masteryResult.displayScore,
          attemptedCount,
        }),
      });
      router.push("/dashboard");
    } finally {
      setGateSaving(false);
    }
  }

  async function handleChallenge() {
    if (!planTaskId) return;
    setGateSaving(true);
    try {
      await fetch(`/api/coach/plan/tasks/${planTaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptedCount: 0 }),
      });
      setSessionCorrect(0);
      setSessionAnswered(0);
      setHintAssistedCorrect(0);
      setAttemptedCount(0);
      setSavedMasteryStatus("not_yet");
      setSavedMasteryScore(null);
      setShowMasteryGate(false);
      writeLocalProgress(planTaskId, 0, targetCount, {
        correct: 0,
        answered: 0,
        hintAssistedCorrect: 0,
      });
      await loadQuestion();
    } finally {
      setGateSaving(false);
    }
  }

  if (showMasteryGate && isPlanSession) {
    return (
      <MasteryGateResult
        title={planTitle ?? "Practice task"}
        outcome={masteryResult.outcome}
        displayScore={masteryResult.displayScore}
        displayMax={masteryResult.displayMax}
        skill={focusSkill}
        saving={gateSaving}
        onPracticeAgain={() => void handlePracticeAgain()}
        onContinueWeek={() => void handleContinueWeek()}
        onChallenge={
          masteryResult.outcome === "passed" && savedMasteryStatus !== "passed"
            ? () => void handleChallenge()
            : undefined
        }
      />
    );
  }

  if (limitReached) {
    return (
      <div className="alert-limit">
        <h2 className="font-display text-lg font-semibold text-ink">Daily limit reached</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Free accounts include 20 AI practice questions per day. Upgrade to Pro for unlimited
          practice.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/plan/quote" className="btn-primary">
            See plans
          </Link>
          {isPlanSession ? (
            <button type="button" className="btn-secondary" onClick={() => void handleSaveAndExit()}>
              Save &amp; return to Dashboard
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (loading && !question) {
    return (
      <div className="space-y-6">
        {isPlanSession ? (
          <div className="rounded-xl border border-jade/30 bg-jade/5 px-4 py-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-ink">Plan task progress</span>
              <span className="font-semibold text-ink">
                {attemptedCount}/{targetCount}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist">
              <div className="h-full rounded-full bg-jade" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">HSK 3 practice</p>
        )}
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
        <button type="button" onClick={() => void loadQuestion()} className="mt-4 btn-primary">
          Try again
        </button>
      </div>
    );
  }

  if (!question) return null;

  const isCorrect = selectedIndex === question.answerIndex;

  return (
    <div className="relative space-y-6">
      <AsyncOverlay active={loading} label="Generating next question…" />

      {isPlanSession ? (
        <div className="sticky top-0 z-10 -mx-1 rounded-xl border border-jade/40 bg-paper px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-jade">Plan task</p>
              <p className="mt-1 font-display text-base font-semibold text-ink">
                {planTitle ?? "Coach practice"}
              </p>
              {focusSkill ? (
                <p className="mt-1 text-xs text-ink-muted">
                  Skill: <span className="capitalize">{focusSkill}</span>
                </p>
              ) : null}
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold tabular-nums text-ink">
                {attemptedCount}/{targetCount}
              </p>
              <p className="text-xs text-ink-muted">questions done</p>
              <button
                type="button"
                disabled={savingExit}
                onClick={() => void handleSaveAndExit()}
                className="mt-2 text-sm text-link"
              >
                {savingExit ? "Saving…" : "Save & exit"}
              </button>
            </div>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full bg-jade transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">HSK 3 practice</p>
            <p className="mt-1 text-sm text-ink-muted">Locked to HSK 3.0 vocabulary.</p>
          </div>
          {limit !== null ? (
            <p className="text-sm text-ink-muted">
              {usedToday}/{limit} questions today
            </p>
          ) : (
            <p className="text-sm text-ink-muted">Unlimited · Pro</p>
          )}
        </div>
      )}

      <div className="surface-card p-8">
        <p className="text-xs font-medium uppercase tracking-wide text-jade">{question.skill}</p>
        <PracticeStem stem={question.stem} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {question.choices.map((choice, index) => {
          let choiceClass =
            "rounded-lg border px-4 py-3 text-left text-sm font-medium transition";
          if (submitted) {
            if (index === question.answerIndex) choiceClass += " border-jade bg-jade/10 text-jade";
            else if (index === selectedIndex) choiceClass += " border-seal bg-seal/10 text-seal";
            else choiceClass += " border-mist bg-white text-ink-muted";
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
            isCorrect ? "border-jade/30 bg-jade/10 text-ink" : "border-seal/30 bg-seal/10 text-ink"
          }`}
        >
          <p className="font-medium">{isCorrect ? "Correct!" : "Not quite."}</p>
          <p className="mt-2 text-sm">{question.explanation}</p>
          {reviewOnly ? (
            <Link href="/practice" className="mt-4 inline-block btn-primary">
              Back to practice
            </Link>
          ) : showMasteryGate && isPlanSession ? (
            <button
              type="button"
              className="mt-4 btn-primary"
              onClick={() => setShowMasteryGate(true)}
            >
              View results
            </button>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={limitReached || loading}
                onClick={() => void loadQuestion()}
                className="btn-primary"
              >
                Next question
              </button>
              {isPlanSession ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => void handleSaveAndExit()}
                >
                  Save &amp; exit
                </button>
              ) : null}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={selectedIndex === null || submitting}
            onClick={() => void handleSubmit()}
            className="flex-1 btn-primary py-3 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit answer"}
          </button>
          {isPlanSession ? (
            <button
              type="button"
              className="btn-secondary py-3"
              onClick={() => void handleSaveAndExit()}
            >
              Save &amp; exit
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
