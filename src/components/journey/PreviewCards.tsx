import Link from "next/link";

export type PreviewGap = {
  skill: string;
  severity: string;
  note?: string | null;
};

type PreviewCardsProps = {
  gaps: PreviewGap[];
};

/**
 * Personalized locked previews — must cite the user's own diagnosis (spec §5).
 * Up to three cards, each naming a skill the user's coach report flagged and
 * linking to /plan/quote.
 */
export function PreviewCards({ gaps }: PreviewCardsProps) {
  const top = gaps.slice(0, 3);
  if (top.length === 0) return null;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      {top.map((gap) => (
        <Link
          key={gap.skill}
          href="/plan/quote"
          className="rounded-lg border border-mist bg-paper/70 p-4 transition hover:border-jade/40"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            Your {gap.skill} gap
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Your diagnosis flagged {gap.skill} ({gap.severity}). Your plan
            includes targeted drills for exactly this weakness.
          </p>
          <p className="mt-2 text-xs font-medium text-jade">
            Included in your package →
          </p>
        </Link>
      ))}
    </div>
  );
}
