import Link from "next/link";
import { FREE_TIER_BENEFITS, PRO_BENEFITS } from "@/lib/payments";

type Tier = {
  name: string;
  price: string;
  period?: string;
  features: readonly string[];
  highlighted?: boolean;
  cta?: { label: string; href: string };
};

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    period: "Forever",
    features: FREE_TIER_BENEFITS,
    cta: { label: "Sign up for free mock exam", href: "/login?next=%2Fmock-exam" },
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    features: PRO_BENEFITS,
    highlighted: true,
    cta: { label: "View Pro plans", href: "/pricing" },
  },
];

function FeatureList({ features }: { features: readonly string[] }) {
  return (
    <ul className="mt-6 flex-1 space-y-3">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2 text-sm text-ink-muted">
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
          {feature}
        </li>
      ))}
    </ul>
  );
}

export default function PricingTable() {
  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
      {TIERS.map((tier) => (
        <div
          key={tier.name}
          className={`relative flex flex-col rounded-2xl border p-6 ${
            tier.highlighted
              ? "border-jade bg-white shadow-lift ring-2 ring-jade/20"
              : "border-mist bg-white shadow-card"
          }`}
        >
          {tier.highlighted ? (
            <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-jade">
              Most popular
            </span>
          ) : null}
          <h3 className="font-display text-xl font-semibold text-ink">{tier.name}</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-4xl font-semibold text-ink">{tier.price}</span>
            {tier.period ? (
              <span className="text-sm text-ink-muted">{tier.period}</span>
            ) : null}
          </div>
          {tier.highlighted ? (
            <p className="mt-1 text-xs text-ink-muted">or $69/year (save ~42%)</p>
          ) : null}
          <FeatureList features={tier.features} />
          {tier.cta ? (
            <Link
              href={tier.cta.href}
              className={`mt-6 block text-center text-sm font-semibold ${
                tier.highlighted ? "btn-primary py-2.5" : "text-link"
              }`}
            >
              {tier.cta.label}
            </Link>
          ) : null}
        </div>
      ))}
    </div>
  );
}
