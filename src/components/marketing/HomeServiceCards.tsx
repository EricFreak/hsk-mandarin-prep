import Link from "next/link";
import { COACH_PACKS } from "@/lib/lp/catalog";
import ContinueCta from "@/components/marketing/ContinueCta";

const ctaClass =
  "flex w-full items-center justify-center rounded-xl bg-jade px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-jade/20 transition hover:bg-jade-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade";

const secondaryLinkClass =
  "mt-3 block text-center text-sm font-medium text-jade hover:text-jade-light";

/** Homepage medium service cards — not a full pricing table. */
export default function HomeServiceCards() {
  const coachPrices = COACH_PACKS.map(
    (p) => `$${(p.priceCents / 100).toFixed(0)}`,
  ).join(" / ");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-3">
        <article className="flex h-full flex-col rounded-2xl border border-mist bg-white p-6 shadow-card sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-jade">
            System-led
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-ink">
            Coach package
          </h3>
          <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-ink">
            {coachPrices}
          </p>
          <p className="mt-1 text-xs text-ink-muted">4 / 8 / 12 weeks · pay once</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            System builds the weeks. You follow. Best when you want a fixed cycle and
            fewer choices.
          </p>
          <div className="mt-auto border-t border-mist/80 pt-6">
            <ContinueCta className={ctaClass}>Start with diagnosis</ContinueCta>
            <Link href="/pricing" className={secondaryLinkClass}>
              Full pricing
            </Link>
          </div>
        </article>

        <article className="flex h-full flex-col rounded-2xl border border-mist bg-white p-6 shadow-card sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-jade">
            You-led
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-ink">
            Custom exam plan
          </h3>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            Priced by workload
          </p>
          <p className="mt-1 text-xs text-ink-muted">One quote after diagnosis</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            You set the mix. We check it fits before exam day — transparent quote, no
            surprises.
          </p>
          <div className="mt-auto border-t border-mist/80 pt-6">
            <ContinueCta className={ctaClass}>Start with diagnosis</ContinueCta>
            <Link href="/pricing" className={secondaryLinkClass}>
              Full pricing
            </Link>
          </div>
        </article>

        <article className="flex h-full flex-col rounded-2xl border border-mist bg-white p-6 shadow-card sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-jade">
            Emergency
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-ink">
            Emergency sprint
          </h3>
          <p className="mt-2 font-display text-2xl font-semibold text-ink">
            First sprint free
          </p>
          <p className="mt-1 text-xs text-ink-muted">Exam ≤ 6 days · once per account</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            Short window. Full push. One free per account — same rate after that, no
            urgency premium.
          </p>
          <div className="mt-auto border-t border-mist/80 pt-6">
            <ContinueCta className={ctaClass}>Start with diagnosis</ContinueCta>
            <Link href="/pricing" className={secondaryLinkClass}>
              Full pricing
            </Link>
          </div>
        </article>
      </div>

      <p className="mt-8 text-center text-sm text-ink-muted">
        Pay once. No subscription. Unused work credited if you replan.
      </p>
    </div>
  );
}
