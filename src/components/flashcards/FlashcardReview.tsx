"use client";

import LoadingPulse, { AsyncOverlay } from "@/components/ui/LoadingPulse";
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
  { quality: 1, label: "Forgot", className: "bg-seal hover:bg-seal-dark" },
  { quality: 2, label: "Hard", className: "bg-seal/80 hover:bg-seal" },
  { quality: 3, label: "Hesitant", className: "bg-ink-muted hover:bg-ink" },
  { quality: 4, label: "Good", className: "bg-jade hover:bg-jade-light" },
  { quality: 5, label: "Easy", className: "bg-jade-light hover:bg-jade" },
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

  if (loading && !card) {
    return (
      <div className="surface-card relative flex min-h-[280px] items-center justify-center p-8">
        <LoadingPulse label="Loading your next card…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-seal/20 bg-seal/5 p-6 text-center">
        <p className="text-sm text-seal">{error}</p>
        <button
          type="button"
          onClick={() => void loadCard()}
          className="mt-4 btn-primary"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!card || !word) {
    return (
      <div className="surface-card p-8 text-center">
        <h2 className="font-display text-lg font-semibold text-ink">All caught up</h2>
        <p className="mt-2 text-sm text-ink-muted">
          No flashcards are due right now. Check back later for your next review
          session.
        </p>
        <button
          type="button"
          onClick={() => void loadCard()}
          className="mt-6 btn-secondary"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      <AsyncOverlay active={loading} label="Loading next card…" />
      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className="w-full rounded-2xl border border-mist bg-white p-10 text-center shadow-card transition hover:border-jade/30 hover:shadow-lift"
      >
        {!flipped ? (
          <p className="text-5xl font-medium text-ink">{word.hanzi}</p>
        ) : (
          <div className="space-y-3">
            <p className="text-4xl font-medium text-ink">{word.hanzi}</p>
            <p className="text-xl text-jade">{formatPinyinSpaced(word.pinyin)}</p>
            <p className="text-lg text-ink-muted">{word.english}</p>
          </div>
        )}
        <p className="mt-6 text-sm text-ink-muted">
          {flipped ? "Tap to hide answer" : "Tap to reveal answer"}
        </p>
      </button>

      {flipped ? (
        <div className="space-y-3">
          <p className="text-center text-xs text-ink-muted">
            How well did you remember this word before flipping?
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {GRADES.map(({ quality, label, className }) => (
            <button
              key={quality}
              type="button"
              disabled={submitting}
              onClick={() => void handleGrade(quality)}
              className={`rounded-lg px-3 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
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
