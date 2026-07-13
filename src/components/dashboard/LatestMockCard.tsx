"use client";

import Link from "next/link";

type LatestExam = {
  id: string;
  score: number;
  created_at: string;
} | null;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Props = {
  exam: LatestExam;
  loaded: boolean;
};

export default function LatestMockCard({ exam, loaded }: Props) {
  return (
    <div className="surface-card p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Latest mock</p>
      {!loaded ? (
        <p className="mt-2 text-sm text-ink-muted">—</p>
      ) : exam ? (
        <>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">{exam.score}%</p>
          <p className="mt-1 text-sm text-ink-muted">HSK 3 — {formatDate(exam.created_at)}</p>
          <div className="mt-3 flex flex-wrap gap-4">
            <Link href={`/mock-exam/attempts/${exam.id}`} className="text-sm text-link">
              Review
            </Link>
            <Link href="/mock-exam/attempts" className="text-sm text-link">
              All attempts →
            </Link>
          </div>
        </>
      ) : (
        <p className="mt-2 text-sm text-ink-muted">
          No mock exam yet.{" "}
          <Link href="/mock-exam" className="text-link">
            Take your first exam
          </Link>
        </p>
      )}
    </div>
  );
}
