"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
  error?: string;
  upgrade?: boolean;
};

const LEVELS = [1, 2, 3] as const;

export default function PracticeSession() {
  const [level, setLevel] = useState<1 | 2 | 3>(3);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [usedToday, setUsedToday] = useState(0);
  const [limit, setLimit] = useState<number | null>(20);

  const loadQuestion = useCallback(async (targetLevel: 1 | 2 | 3) => {
    setLoading(true);
    setError(null);
    setLimitReached(false);
    setQuestionId(null);
    setQuestion(null);
    setSelectedIndex(null);
    setSubmitted(false);

    try {
      const response = await fetch(`/api/practice/generate?level=${targetLevel}`);
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
    } catch {
      setError("Failed to load practice question");
    } finally {
      setLoading(false);
    }
  }, []);

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
    } catch {
      setError("Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  }

  if (limitReached) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-900">Daily limit reached</h2>
        <p className="mt-2 text-sm text-gray-600">
          Free accounts include 20 AI practice questions per day. Upgrade to Pro for
          unlimited practice.
        </p>
        <Link
          href="/pricing"
          className="mt-6 inline-block rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          View pricing
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-gray-200 bg-white p-8">
        <p className="text-sm text-gray-500">Generating your next question...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => void loadQuestion(level)}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">HSK level</span>
          {LEVELS.map((value) => (
            <button
              key={value}
              type="button"
              disabled={submitting || submitted}
              onClick={() => setLevel(value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                level === value
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {value}
            </button>
          ))}
        </div>
        {limit !== null ? (
          <p className="text-sm text-gray-500">
            {usedToday}/{limit} questions today
          </p>
        ) : null}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
          {question.skill}
        </p>
        <p className="mt-4 text-2xl font-medium text-gray-900">{question.stem}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {question.choices.map((choice, index) => {
          let choiceClass =
            "rounded-lg border px-4 py-3 text-left text-sm font-medium transition";

          if (submitted) {
            if (index === question.answerIndex) {
              choiceClass += " border-green-500 bg-green-50 text-green-900";
            } else if (index === selectedIndex) {
              choiceClass += " border-red-500 bg-red-50 text-red-900";
            } else {
              choiceClass += " border-gray-200 bg-white text-gray-700";
            }
          } else if (selectedIndex === index) {
            choiceClass += " border-blue-600 bg-blue-50 text-blue-900";
          } else {
            choiceClass += " border-gray-200 bg-white text-gray-800 hover:border-blue-300";
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
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <p className="font-medium">{isCorrect ? "Correct!" : "Not quite."}</p>
          <p className="mt-2 text-sm">{question.explanation}</p>
          <button
            type="button"
            disabled={limitReached}
            onClick={() => void loadQuestion(level)}
            className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next question
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={selectedIndex === null || submitting}
          onClick={() => void handleSubmit()}
          className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit answer"}
        </button>
      )}
    </div>
  );
}
