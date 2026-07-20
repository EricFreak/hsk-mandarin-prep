import Link from "next/link";
import { COACH_PACKS } from "@/lib/lp/catalog";
import ContinueCta from "@/components/marketing/ContinueCta";

/**
 * Homepage orientation cards — outcomes after diagnosis, not a chooser.
 * Current pack prices shown; custom/sprint explain unit-rate logic (no historical quotes).
 */
export default function HomeServiceCards() {
  const fromPrice = Math.min(...COACH_PACKS.map((p) => p.priceCents)) / 100;
  const packPrices = COACH_PACKS.map((p) => `$${p.priceCents / 100}`).join(" / ");
  const packWeeks = COACH_PACKS.map((p) => p.weeks).join(" / ");

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-center font-display text-2xl font-semibold tabular-nums text-ink">
        From ${fromPrice.toFixed(0)} · pay once
      </p>
      <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink-muted">
        Coach packs, custom exam plans, and emergency sprints use the same unit rate.
        Your personal custom quote comes after diagnosis. Pack ends when the weeks end —
        no subscription.
      </p>

      <ul className="mt-10 grid gap-6 sm:grid-cols-3">
        <li className="rounded-2xl border border-mist bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-jade">
            System-led
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-ink">
            Coach Package
          </h3>
          <p className="mt-2 font-display text-xl font-semibold tabular-nums text-ink">
            {packPrices}
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {packWeeks} weeks · pay once
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Fixed cycles. The system builds the weeks; you follow.
          </p>
        </li>
        <li className="rounded-2xl border border-mist bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-jade">
            You-led
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-ink">
            Custom Exam Plan
          </h3>
          <p className="mt-2 font-display text-xl font-semibold text-ink">Same unit rate</p>
          <p className="mt-0.5 text-xs text-ink-muted">Workload priced after diagnosis</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            You set the mix. One transparent quote for the work you schedule — same rate
            as coach packs, not a separate markup.
          </p>
        </li>
        <li className="rounded-2xl border border-mist bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-jade">
            Emergency
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold text-ink">
            Emergency Sprint
          </h3>
          <p className="mt-2 font-display text-xl font-semibold text-ink">First one free</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            ≤6 days · then ~${fromPrice.toFixed(0)} at the same rate
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Exam soon. First sprint free once per account; no urgency premium after.
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
