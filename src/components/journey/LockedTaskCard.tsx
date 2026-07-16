import Link from "next/link";

type LockedTaskCardProps = {
  rank: number;
  title: string;
  skill: string | null;
};

/**
 * Locked preview card for a task the free user cannot execute yet. The
 * personalized title stays visible (that IS the preview value); clicking
 * routes to /plan/quote. Rendered as an <li> so it drops into the week's <ol>.
 */
export function LockedTaskCard({ rank, title, skill }: LockedTaskCardProps) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-mist bg-paper/60 px-4 py-3">
      <Link href="/plan/quote" className="flex min-w-0 flex-1 items-center gap-2">
        <span className="text-xs font-semibold text-ink-muted">{rank}</span>
        <span
          className="mt-0.5 shrink-0 text-ink-muted"
          aria-hidden="true"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-1.5 0h12A1.5 1.5 0 0 1 21 12v6.75A1.5 1.5 0 0 1 19.5 20.25h-15A1.5 1.5 0 0 1 3 18.75V12a1.5 1.5 0 0 1 1.5-1.5Z"
            />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{title}</p>
          {skill ? (
            <p className="mt-0.5 text-xs capitalize text-ink-muted">{skill}</p>
          ) : null}
        </div>
      </Link>
      <Link
        href="/plan/quote"
        className="rounded-full border border-mist bg-paper px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted transition hover:border-jade/40 hover:text-jade"
      >
        Included in your package
      </Link>
    </li>
  );
}
