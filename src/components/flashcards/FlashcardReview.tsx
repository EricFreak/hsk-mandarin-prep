"use client";

import { formatPinyinSpaced } from "@/lib/pinyin";
import { useCallback, useEffect, useState } from "react";

type ReviewWord = {
  hanzi: string;
  pinyin: string;
  english: string;
};

type ReviewCard = {
  id: string;
  wordId: string;
  level: number;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
  dueAt: string;
};

type ReviewResponse = {
  card: ReviewCard | null;
  word: ReviewWord | null;
  showAnswer: boolean;
};

const GRADES = [
  { quality: 1, label: "Forgot" },
  { quality: 2, label: "Hard" },
  { quality: 3, label: "Hesitant" },
  { quality: 4, label: "Good" },
  { quality: 5, label: "Easy" },
] as const;

export default function FlashcardReview() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<ReviewCard | null>(null);
  const [word, setWord] = useState<ReviewWord | null>(null);
  const [flipped, setFlipped] = useState(false);

  const loadCard = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFlipped(false);

    try {
      const response = await fetch("/api/srs/review");
      const data = (await response.json()) as ReviewResponse & {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Failed to load flashcard");
        setCard(null);
        setWord(null);
        return;
      }

      setCard(data.card);
      setWord(data.word);
    } catch {
      setError("Failed to load flashcard");
      setCard(null);
      setWord(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCard();
  }, [loadCard]);

  async function handleGrade(quality: number) {
    if (!card || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/srs/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: card.wordId, quality }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to save grade");
        return;
      }

      await loadCard();
    } catch {
      setError("Failed to save grade");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-gray-200 bg-white p-8">
        <p className="text-sm text-gray-500">Loading your next card...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => void loadCard()}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!card || !word) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-900">All caught up</h2>
        <p className="mt-2 text-sm text-gray-600">
          No flashcards are due right now. Check back later for your next review
          session.
        </p>
        <button
          type="button"
          onClick={() => void loadCard()}
          className="mt-6 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className="w-full rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm transition hover:border-blue-300 hover:shadow-md"
      >
        {!flipped ? (
          <p className="text-5xl font-medium text-gray-900">{word.hanzi}</p>
        ) : (
          <div className="space-y-3">
            <p className="text-4xl font-medium text-gray-900">{word.hanzi}</p>
            <p className="text-xl text-blue-700">{formatPinyinSpaced(word.pinyin)}</p>
            <p className="text-lg text-gray-700">{word.english}</p>
          </div>
        )}
        <p className="mt-6 text-sm text-gray-500">
          {flipped ? "Tap to hide answer" : "Tap to reveal answer"}
        </p>
      </button>

      {flipped ? (
        <div className="space-y-3">
          <p className="text-center text-xs text-gray-500">
            How well did you remember this word before flipping?
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {GRADES.map(({ quality, label }) => (
            <button
              key={quality}
              type="button"
              disabled={submitting}
              onClick={() => void handleGrade(quality)}
              className="rounded-md bg-gray-900 px-3 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {label}
            </button>
          ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
