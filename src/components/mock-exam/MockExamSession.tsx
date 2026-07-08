"use client";

import Link from "next/link";
import { useState } from "react";
import UpgradeCTA from "@/components/paywall/UpgradeCTA";
import {
  HSK3_MOCK_EXAM,
  HSK3_MOCK_EXAM_MCQ_COUNT,
  type MockExamQuestion,
} from "@/lib/mock-exam/hsk3-template";
import type { WeaknessEntry } from "@/lib/weakness";

type AnswerState = {
  selectedIndex?: number;
  writingText?: string;
};

type SubmitResponse = {
  score?: number;
  correctCount?: number;
  totalMcq?: number;
  weaknesses?: WeaknessEntry[];
  error?: string;
  upgrade?: boolean;
};

export default function MockExamSession() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);

  const question = HSK3_MOCK_EXAM[step];
  const isLast = step === HSK3_MOCK_EXAM.length - 1;
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
      const payload = {
        answers: HSK3_MOCK_EXAM.map((q) => ({
          questionId: q.id,
          selectedIndex: answers[q.id]?.selectedIndex,
          writingText: answers[q.id]?.writingText,
        })),
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
        <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Exam complete</h2>
          <p className="mt-2 text-4xl font-bold text-green-700">{result.score}%</p>
          <p className="mt-2 text-sm text-gray-600">
            {result.correctCount}/{result.totalMcq ?? HSK3_MOCK_EXAM_MCQ_COUNT} multiple-choice
            questions correct
          </p>
        </div>

        {result.weaknesses && result.weaknesses.length > 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-gray-900">Areas to improve</h3>
            <ul className="mt-3 space-y-2">
              {result.weaknesses.map((entry) => (
                <li key={entry.skill} className="text-sm text-gray-700">
                  <span className="font-medium capitalize">{entry.skill}</span> —{" "}
                  {entry.wrongCount} incorrect
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
            Great work — no major skill gaps detected on this attempt.
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            View dashboard
          </Link>
          <Link
            href="/practice"
            className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Practice weak areas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Question {step + 1} of {HSK3_MOCK_EXAM.length}
        </span>
        <span className="capitalize">{question.section}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${((step + 1) / HSK3_MOCK_EXAM.length) * 100}%` }}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
          {question.skill}
        </p>
        <p className="mt-4 whitespace-pre-line text-xl font-medium text-gray-900">
          {question.stem}
        </p>
      </div>

      {question.section === "writing" ? (
        <textarea
          value={currentAnswer.writingText ?? ""}
          onChange={(event) =>
            updateAnswer(question.id, { writingText: event.target.value })
          }
          rows={6}
          placeholder="Write your answer in Chinese..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  ? "border-blue-600 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white text-gray-800 hover:border-blue-300"
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
          className="rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!canAdvance(question) || submitting}
          onClick={handleNext}
          className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
