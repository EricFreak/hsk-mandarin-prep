import Link from "next/link";
import { COACH_PACKS } from "@/lib/lp/catalog";
import ContinueCta from "@/components/marketing/ContinueCta";

/**
 * Homepage orientation cards — outcomes after diagnosis, not a chooser.
 * Single CTA lives at section level (see page.tsx / footer below).
 */
export default function HomeServiceCards() {
  const fromPrice = Math.min(...COACH_PACKS.map((p) => p.priceCents)) / 100;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-center font-display text-2xl font-semibold tabular-nums text-ink">
        From ${fromPrice.toFixed(0)} · pay once
      </p>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink-muted">
        Coach packs, custom exam plans, and emergency sprints use the same unit rate.
        Your personal quote comes after diagnosis — not before.
      </p>

      <ul className="mt-10 grid gap-6 sm:grid-cols-3">
        <li className="rounded-2xl border border-mist bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-jade">
            System-led
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-ink">
            Coach package
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Fixed 4 / 8 / 12-week cycles. The system builds the weeks; you follow.
          </p>
        </li>
        <li className="rounded-2xl border border-mist bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-jade">
            You-led
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-ink">
            Custom exam plan
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            You set the mix. One transparent quote after diagnosis — pay for the work
            you schedule.
          </p>
        </li>
        <li className="rounded-2xl border border-mist bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-jade">
            Emergency
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-ink">
            Emergency sprint
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Exam in ≤6 days. First sprint free once per account; same unit rate after.
          </p>
        </li>
      </ul>

      <div className="mt-10 flex flex-col items-center gap-3">
        <ContinueCta className="btn-primary px-6 py-3 text-base">
          Start with a free diagnosis
        </ContinueCta>
        <Link
          href="/pricing"
          className="text-sm font-medium text-jade hover:text-jade-light"
        >
          Full pricing
        </Link>
      </div>
    </div>
  );
}
