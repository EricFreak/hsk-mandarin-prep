import Link from "next/link";
import { COACH_PACKS } from "@/lib/lp/catalog";
import { FREE_TIER_BENEFITS, PRO_BENEFITS } from "@/lib/payments";

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-jade"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function FeatureList({ features }: { features: readonly string[] }) {
  return (
    <ul className="mt-6 flex-1 space-y-3">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2 text-sm text-ink-muted">
          <CheckIcon />
          {feature}
        </li>
      ))}
    </ul>
  );
}

function CardCtaFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-auto border-t border-mist/80 pt-6">{children}</div>;
}

const pricingCtaClass = {
  free: "flex w-full items-center justify-center rounded-xl border border-mist/90 bg-paper-dark px-4 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-jade/40 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade",
  pro: "flex w-full items-center justify-center rounded-xl bg-jade px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-jade/20 transition hover:bg-jade-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade",
} as const;

type PricingPlansProps = {
  /** Free-chain card CTA — resolved on the server (auth-aware). */
  freeCtaHref?: string;
  /** Service card CTA — /plan/quote when signed in, signup funnel when out. */
  serviceCtaHref?: string;
  serviceCtaLabel?: string;
};

export default function PricingPlans({
  freeCtaHref = "/login?next=%2Fonboarding",
  serviceCtaHref = "/login?next=%2Fonboarding",
  serviceCtaLabel = "Start free",
}: PricingPlansProps) {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex h-full flex-col rounded-2xl border border-mist bg-white p-6 shadow-card sm:p-8">
          <h3 className="font-display text-xl font-semibold text-ink">Free</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-4xl font-semibold tabular-nums text-ink">$0</span>
            <span className="text-sm text-ink-muted">Forever</span>
          </div>
          <FeatureList features={FREE_TIER_BENEFITS} />
          <CardCtaFooter>
            <Link href={freeCtaHref} className={pricingCtaClass.free}>
              Start free diagnosis
            </Link>
          </CardCtaFooter>
        </div>

        <div className="flex h-full flex-col rounded-2xl border border-jade bg-white p-6 shadow-lift ring-2 ring-jade/20 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-jade">
            Pay once
          </span>
          <h3 className="mt-1 font-display text-xl font-semibold text-ink">
            Coach packages
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            One rate for every plan. Custom exam plans and emergency sprints are priced the
            same way.
          </p>

          <ul className="mt-6 flex-1 space-y-3">
            {COACH_PACKS.map((pack) => (
              <li
                key={pack.id}
                className="flex items-baseline justify-between gap-3 rounded-xl border border-mist/80 bg-paper-dark/40 px-4 py-3"
              >
                <span className="text-sm font-medium text-ink">
                  {pack.weeks} weeks
                </span>
                <span className="font-display text-lg font-semibold tabular-nums text-ink">
                  ${(pack.priceCents / 100).toFixed(0)}
                </span>
              </li>
            ))}
          </ul>

          <CardCtaFooter>
            <Link href={serviceCtaHref} className={pricingCtaClass.pro}>
              {serviceCtaLabel}
            </Link>
          </CardCtaFooter>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="flex h-full flex-col rounded-2xl border border-mist bg-white p-6 shadow-card sm:p-8">
          <h3 className="font-display text-xl font-semibold text-ink">
            Custom exam plan
          </h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-2xl font-semibold tabular-nums text-ink">
              Priced by workload
            </span>
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            Pay for exactly the work you schedule. After your diagnosis we generate a
            transparent quote — no bundles, no surprises.
          </p>
          <FeatureList features={PRO_BENEFITS} />
          <CardCtaFooter>
            <Link href={serviceCtaHref} className={pricingCtaClass.pro}>
              {serviceCtaLabel}
            </Link>
          </CardCtaFooter>
        </div>

        <div className="flex h-full flex-col rounded-2xl border border-mist bg-white p-6 shadow-card sm:p-8">
          <h3 className="font-display text-xl font-semibold text-ink">
            Emergency sprint
          </h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-2xl font-semibold tabular-nums text-ink">
              First one free
            </span>
            <span className="text-sm text-ink-muted">Exam ≤ 6 days</span>
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            When the exam is close and you need a focused push, the first sprint is on us —
            same single rate applies after that.
          </p>
          <CardCtaFooter>
            <Link href={serviceCtaHref} className={pricingCtaClass.pro}>
              {serviceCtaLabel}
            </Link>
          </CardCtaFooter>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-mist/80 bg-paper-dark/40 p-6 text-sm text-ink-muted sm:p-8">
        <h4 className="font-display text-base font-semibold text-ink">
          How pricing works
        </h4>
        <ul className="mt-3 space-y-2">
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>One single rate for every plan — coach, custom, or sprint.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>No urgency premium, even when your exam is days away.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon />
            <span>Unused work is credited when you replan, so you never pay for nothing.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
