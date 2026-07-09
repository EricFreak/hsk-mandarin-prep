type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-mist ${className}`}
      aria-hidden
    />
  );
}

export function AppPageSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Loading page">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy aria-label="Loading dashboard">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>

      <Skeleton className="h-56 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  );
}

export function PracticeQuestionSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-label="Generating question">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="surface-card space-y-4 p-8">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-full max-w-xl" />
        <Skeleton className="h-6 w-4/5 max-w-lg" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>

      <p className="text-center text-sm text-ink-muted">
        Generating your next question…
      </p>
    </div>
  );
}

export function FlashcardSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading flashcard">
      <div className="surface-card flex min-h-[280px] flex-col items-center justify-center p-10">
        <Skeleton className="h-16 w-24 rounded-lg" />
        <Skeleton className="mt-8 h-4 w-40" />
      </div>
      <p className="text-center text-sm text-ink-muted">Loading your next card…</p>
    </div>
  );
}
